package com.techstore.service.order;

import com.techstore.dto.cart.CartItemRequest;
import com.techstore.dto.cart.CartResponse;
import com.techstore.dto.order.CheckoutRequest;
import com.techstore.dto.order.OrderResponse;
import com.techstore.dto.order.ReorderResponse;
import com.techstore.entity.inventory.TransactionType;
import com.techstore.entity.order.Coupon;
import com.techstore.entity.order.DiscountType;
import com.techstore.entity.order.Order;
import com.techstore.entity.order.OrderItem;
import com.techstore.entity.order.OrderStatus;
import com.techstore.entity.product.ProductVariant;
import com.techstore.entity.user.User;
import com.techstore.exception.AppException;
import com.techstore.exception.ErrorCode;
import com.techstore.repository.order.CouponRepository;
import com.techstore.repository.order.OrderRepository;
import com.techstore.repository.product.ProductVariantRepository;
import com.techstore.security.LogAction;
import com.techstore.service.cart.CartService;
import com.techstore.service.inventory.InventoryCommandService;
import com.techstore.service.loyalty.LoyaltyService;
import com.techstore.service.notification.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderCommandService {

    private final OrderRepository orderRepository;
    private final ProductVariantRepository variantRepository;
    private final CouponRepository couponRepository;
    private final InventoryCommandService inventoryCommandService;
    private final CartService cartService;
    private final EmailService emailService;
    private final LoyaltyService loyaltyService;
    private final OrderMapper orderMapper;

    @Transactional
    @CacheEvict(value = "analytics", allEntries = true)
    @LogAction("CREATE_ORDER")
    public String createOrder(User user, CheckoutRequest request) {
        // 1. Check Idempotency
        if (orderRepository.existsByIdempotencyKey(request.getIdempotencyKey())) {
            throw new AppException(ErrorCode.DUPLICATE_ORDER);
        }

        Order order = Order.builder()
                .user(user)
                .status(OrderStatus.PENDING)
                .receiverName(request.getReceiverName())
                .receiverPhone(request.getReceiverPhone())
                .shippingAddress(request.getShippingAddress())
                .note(request.getNote())
                .idempotencyKey(request.getIdempotencyKey())
                .items(new ArrayList<>())
                .timeline(new ArrayList<>())
                .build();

        order.getTimeline().add(com.techstore.entity.order.OrderHistory.builder()
                .order(order)
                .status(OrderStatus.PENDING)
                .description("Đơn hàng đã được đặt thành công")
                .build());

        BigDecimal subTotal = processCheckoutItems(user, request, order);
        PricingResult pricing = calculatePricing(subTotal, request.getCouponCode(), request.getPointsToSpend());

        order.setSubTotal(subTotal);
        order.setShippingFee(pricing.shippingFee());
        order.setDiscountAmount(pricing.discountAmount());
        order.setCoupon(pricing.coupon());
        order.setPointsSpent(request.getPointsToSpend());
        order.setPointsEarned(loyaltyService.calculatePointsForAmount(pricing.totalAmount()));
        order.setTotalAmount(pricing.totalAmount());

        // Spend points if applicable
        if (request.getPointsToSpend() != null && request.getPointsToSpend() > 0) {
            loyaltyService.spendPoints(user, request.getPointsToSpend(), "ORDER_TEMP_" + request.getIdempotencyKey());
        }

        // 6. Save Order
        Order savedOrder = orderRepository.save(order);
        sendOrderConfirmationEmail(user, savedOrder);

        return savedOrder.getId();
    }

    @Transactional
    @CacheEvict(value = "analytics", allEntries = true)
    @LogAction("UPDATE_ORDER_STATUS")
    public OrderResponse updateOrderStatus(String orderId, OrderStatus status) {
        Order order = orderRepository.fetchByIdWithDetails(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        order.setStatus(status);
        if (order.getTimeline() == null) {
            order.setTimeline(new ArrayList<>());
        }
        order.getTimeline().add(com.techstore.entity.order.OrderHistory.builder()
                .order(order)
                .status(status)
                .description("Trạng thái đơn hàng được cập nhật thành: " + status.name())
                .build());

        // Award points if delivered
        if (status == OrderStatus.DELIVERED && order.getPointsEarned() != null && order.getPointsEarned() > 0) {
            loyaltyService.earnPoints(order.getUser(), order.getTotalAmount(), order.getId());
        }

        Order updatedOrder = orderRepository.save(order);

        return orderMapper.mapToOrderResponse(updatedOrder);
    }

    @Transactional
    @CacheEvict(value = "analytics", allEntries = true)
    @LogAction("CONFIRM_ORDER_RECEIPT")
    public OrderResponse confirmReceipt(String orderId, User user) {
        Order order = orderRepository.fetchByIdWithDetails(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (order.getStatus() != OrderStatus.SHIPPING) {
            throw new AppException(ErrorCode.INVALID_STATUS_UPDATE);
        }

        order.setStatus(OrderStatus.DELIVERED);
        if (order.getTimeline() == null) {
            order.setTimeline(new ArrayList<>());
        }
        order.getTimeline().add(com.techstore.entity.order.OrderHistory.builder()
                .order(order)
                .status(OrderStatus.DELIVERED)
                .description("Khách hàng đã xác nhận nhận hàng thành công")
                .build());

        // Award points
        if (order.getPointsEarned() != null && order.getPointsEarned() > 0) {
            loyaltyService.earnPoints(user, order.getTotalAmount(), order.getId());
        }

        return orderMapper.mapToOrderResponse(orderRepository.save(order));
    }

    @Transactional
    @CacheEvict(value = "analytics", allEntries = true)
    @LogAction("CANCEL_ORDER")
    public OrderResponse cancelOrder(String orderId, User user) {
        Order order = orderRepository.fetchByIdWithDetails(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (!orderMapper.canCancelOrder(order)) {
            throw new AppException(ErrorCode.ORDER_CANCELLATION_NOT_ALLOWED);
        }

        order.setStatus(OrderStatus.CANCELLED);
        if (order.getTimeline() == null) {
            order.setTimeline(new ArrayList<>());
        }
        order.getTimeline().add(com.techstore.entity.order.OrderHistory.builder()
                .order(order)
                .status(OrderStatus.CANCELLED)
                .description("Khách hàng đã hủy đơn hàng")
                .build());

        for (OrderItem item : order.getItems()) {
            if (item.getVariant() == null || item.getQuantity() == null || item.getQuantity() <= 0) {
                continue;
            }

            inventoryCommandService.processTransaction(
                    item.getVariant().getId(),
                    TransactionType.RETURN,
                    item.getQuantity(),
                    null,
                    "ORDER_CANCEL_" + order.getId(),
                    "Customer cancelled order",
                    user.getId(),
                    "MAIN_WAREHOUSE"
            );
        }

        if (order.getCoupon() != null && order.getCoupon().getUsedCount() > 0) {
            order.getCoupon().setUsedCount(order.getCoupon().getUsedCount() - 1);
            couponRepository.save(order.getCoupon());
        }

        // Refund points if applicable
        if (order.getPointsSpent() != null && order.getPointsSpent() > 0) {
            loyaltyService.refundPoints(user, order.getPointsSpent(), "Hoàn điểm do hủy đơn hàng " + order.getId(), order.getId());
        }

        return orderMapper.mapToOrderResponse(orderRepository.save(order));
    }

    @Transactional
    public ReorderResponse reorder(String orderId, User user) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        List<ReorderResponse.UnavailableItem> unavailableItems = new ArrayList<>();
        int addedItemsCount = 0;

        for (OrderItem orderItem : order.getItems()) {
            ProductVariant variant = orderItem.getVariant();

            if (variant == null) {
                unavailableItems.add(ReorderResponse.UnavailableItem.builder()
                        .variantId(orderItem.getVariant() != null ? orderItem.getVariant().getId() : null)
                        .variantName(orderItem.getVariantName())
                        .variantSku(orderItem.getVariantSku())
                        .requestedQuantity(orderItem.getQuantity())
                        .reason("product no longer available")
                        .build());
                continue;
            }

            if (variant.getStockQuantity() < orderItem.getQuantity()) {
                unavailableItems.add(ReorderResponse.UnavailableItem.builder()
                        .variantId(variant.getId())
                        .variantName(orderItem.getVariantName())
                        .variantSku(orderItem.getVariantSku())
                        .requestedQuantity(orderItem.getQuantity())
                        .reason("insufficient inventory")
                        .build());
                continue;
            }

            CartItemRequest cartItemRequest = new CartItemRequest();
            cartItemRequest.setVariantId(variant.getId());
            cartItemRequest.setQuantity(orderItem.getQuantity());

            try {
                cartService.addToCart(user, cartItemRequest);
                addedItemsCount++;
            } catch (AppException e) {
                unavailableItems.add(ReorderResponse.UnavailableItem.builder()
                        .variantId(variant.getId())
                        .variantName(orderItem.getVariantName())
                        .variantSku(orderItem.getVariantSku())
                        .requestedQuantity(orderItem.getQuantity())
                        .reason(e.getErrorCode() == ErrorCode.INSUFFICIENT_STOCK ? "insufficient inventory" : "error adding to cart")
                        .build());
            }
        }

        CartResponse cartResponse = cartService.getCart(user);
        String message;
        if (addedItemsCount == 0) {
            message = "All items are unavailable for reorder";
        } else if (unavailableItems.isEmpty()) {
            message = "All items added to cart successfully";
        } else {
            message = String.format("%d item(s) added to cart, %d item(s) unavailable", addedItemsCount, unavailableItems.size());
        }

        return ReorderResponse.builder()
                .cart(cartResponse)
                .unavailableItems(unavailableItems)
                .message(message)
                .addedItemsCount(addedItemsCount)
                .build();
    }

    private void sendOrderConfirmationEmail(User user, Order savedOrder) {
        try {
            String currencyFormat = new java.text.DecimalFormat("#,###").format(savedOrder.getTotalAmount()) + " VNĐ";
            emailService.sendOrderConfirmation(
                    user.getEmail(),
                    savedOrder.getId(),
                    user.getFullName(),
                    currencyFormat
            );
        } catch (Exception e) {
            log.error("FAILED TO SEND ORDER EMAIL: {}", e.getMessage());
        }
    }

    private BigDecimal processCheckoutItems(User user, CheckoutRequest request, Order order) {
        BigDecimal subTotal = BigDecimal.ZERO;

        for (CheckoutRequest.CartItemRequest itemReq : request.getItems()) {
            ProductVariant variant = variantRepository.findByIdWithLock(itemReq.getVariantId())
                    .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_FOUND));

            if (variant.getStockQuantity() < itemReq.getQuantity()) {
                throw new AppException(ErrorCode.INSUFFICIENT_STOCK);
            }

            BigDecimal itemTotal = variant.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            subTotal = subTotal.add(itemTotal);

            String productName = variant.getProduct().getName();
            String variantName = variant.getName().contains(productName) ? variant.getName() : productName + " - " + variant.getName();
            String imageUrl = variant.getProduct().getImages() == null || variant.getProduct().getImages().isEmpty()
                    ? null
                    : variant.getProduct().getImages().iterator().next().getImageUrl();

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .variant(variant)
                    .variantName(variantName)
                    .variantSku(variant.getSku())
                    .imageUrl(imageUrl)
                    .priceAtPurchase(variant.getPrice())
                    .quantity(itemReq.getQuantity())
                    .build();
            order.getItems().add(orderItem);

            inventoryCommandService.processTransaction(
                    variant.getId(),
                    TransactionType.EXPORT,
                    itemReq.getQuantity(),
                    null,
                    "ORDER_TEMP_" + request.getIdempotencyKey(),
                    "Checkout for order",
                    user.getId(),
                    "MAIN_WAREHOUSE"
            );
        }

        return subTotal;
    }

    private PricingResult calculatePricing(BigDecimal subTotal, String couponCode, Integer pointsToSpend) {
        BigDecimal shippingFee = subTotal.compareTo(new BigDecimal("2000000")) >= 0 ? BigDecimal.ZERO : new BigDecimal("30000");
        BigDecimal discountAmount = BigDecimal.ZERO;
        Coupon coupon = null;

        // 1. Coupon Discount
        if (couponCode != null && !couponCode.isEmpty()) {
            coupon = couponRepository.findByCodeAndActiveTrue(couponCode)
                    .orElseThrow(() -> new AppException(ErrorCode.COUPON_INVALID));

            if (coupon.getExpirationDate().isBefore(Instant.now()) || (coupon.getUsageLimit() > 0 && coupon.getUsedCount() >= coupon.getUsageLimit())) {
                throw new AppException(ErrorCode.COUPON_INVALID);
            }

            if (subTotal.compareTo(coupon.getMinPurchase()) < 0) {
                throw new AppException(ErrorCode.COUPON_INVALID);
            }

            if (coupon.getDiscountType() == DiscountType.PERCENT) {
                discountAmount = subTotal.multiply(coupon.getDiscountValue().divide(new BigDecimal("100")));
                if (coupon.getMaxDiscount() != null && discountAmount.compareTo(coupon.getMaxDiscount()) > 0) {
                    discountAmount = coupon.getMaxDiscount();
                }
            } else {
                discountAmount = coupon.getDiscountValue();
            }

            coupon.setUsedCount(coupon.getUsedCount() + 1);
            couponRepository.save(coupon);
        }

        // 2. Loyalty Point Discount
        if (pointsToSpend != null && pointsToSpend > 0) {
            BigDecimal pointDiscount = loyaltyService.calculateDiscountForPoints(pointsToSpend);
            discountAmount = discountAmount.add(pointDiscount);
        }

        BigDecimal totalAmount = subTotal.add(shippingFee).subtract(discountAmount);
        if (totalAmount.compareTo(BigDecimal.ZERO) < 0) {
            totalAmount = BigDecimal.ZERO;
        }

        return new PricingResult(shippingFee, discountAmount, totalAmount, coupon);
    }

    private record PricingResult(BigDecimal shippingFee, BigDecimal discountAmount, BigDecimal totalAmount, Coupon coupon) {}
}
