package com.techstore.service.order;

import com.techstore.dto.order.OrderHistoryResponse;
import com.techstore.dto.order.OrderResponse;
import com.techstore.entity.order.Order;
import com.techstore.entity.order.OrderItem;
import com.techstore.entity.order.OrderStatus;
import com.techstore.entity.payment.PaymentStatus;
import com.techstore.repository.payment.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class OrderMapper {

    private final PaymentRepository paymentRepository;

    public OrderResponse mapToOrderResponse(Order order) {
        return mapToOrderResponse(order, true);
    }

    public OrderResponse mapToOrderResponse(Order order, boolean includeCanCancel) {
        List<OrderResponse.OrderItemResponse> items = order.getItems() != null ? 
                order.getItems().stream()
                .filter(java.util.Objects::nonNull)
                // Deduplicate by ID to fix JPA JOIN fetch duplicates
                .collect(Collectors.collectingAndThen(
                    Collectors.toMap(OrderItem::getId, i -> i, (i1, i2) -> i1, java.util.LinkedHashMap::new),
                    map -> map.values().stream().map(this::mapToOrderItemResponse).collect(Collectors.toList())
                )) : List.of();

        List<OrderHistoryResponse> timeline = order.getTimeline() != null ?
                order.getTimeline().stream()
                .map(h -> OrderHistoryResponse.builder()
                        .id(h.getId())
                        .status(h.getStatus())
                        .description(h.getDescription())
                        .createdAt(h.getCreatedAt())
                        .build())
                .collect(Collectors.toList()) : List.of();

        String paymentMethod = paymentRepository.findByOrderId(order.getId()).stream()
                .findFirst()
                .map(p -> p.getPaymentMethod().name())
                .orElse("COD");

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(generateOrderNumber(order))
                .receiverName(order.getReceiverName())
                .receiverPhone(order.getReceiverPhone())
                .receiverEmail(order.getUser() != null ? order.getUser().getEmail() : null)
                .shippingAddress(order.getShippingAddress())
                .subTotal(order.getSubTotal())
                .shippingFee(order.getShippingFee())
                .discountAmount(order.getDiscountAmount())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .canCancel(includeCanCancel && canCancelOrder(order))
                .note(order.getNote())
                .pointsSpent(order.getPointsSpent())
                .pointsEarned(order.getPointsEarned())
                .createdAt(order.getCreatedAt())
                .paymentMethod(paymentMethod)
                .items(items)
                .timeline(timeline)
                .build();
    }

    public OrderResponse.OrderItemResponse mapToOrderItemResponse(OrderItem item) {
        String imageUrl = item.getImageUrl();
        if (imageUrl == null && item.getVariant() != null && item.getVariant().getProduct() != null) {
            var product = item.getVariant().getProduct();
            if (product.getImages() != null && !product.getImages().isEmpty()) {
                imageUrl = product.getImages().iterator().next().getImageUrl();
            }
        }

        return OrderResponse.OrderItemResponse.builder()
                .id(item.getId())
                .variantId(item.getVariant() != null ? item.getVariant().getId() : null)
                .productId(item.getVariant() != null && item.getVariant().getProduct() != null ? item.getVariant().getProduct().getId() : null)
                .productName(item.getVariant() != null && item.getVariant().getProduct() != null ? item.getVariant().getProduct().getName() : null)
                .variantName(item.getVariantName())
                .variantSku(item.getVariantSku())
                .imageUrl(imageUrl)
                .priceAtPurchase(item.getPriceAtPurchase())
                .quantity(item.getQuantity())
                .build();
    }

    public boolean canCancelOrder(Order order) {
        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CONFIRMED) {
            return false;
        }

        return paymentRepository.findByOrderId(order.getId()).stream()
                .noneMatch(payment -> payment.getStatus() == PaymentStatus.SUCCESS);
    }

    private String generateOrderNumber(Order order) {
        String datePart = java.time.format.DateTimeFormatter.ofPattern("yyMMdd")
                .format(order.getCreatedAt() != null ? order.getCreatedAt() : java.time.LocalDateTime.now());
        String idPart = order.getId() != null ? (order.getId().length() > 8 ? order.getId().substring(0, 8) : order.getId()) : "TEMP";
        return String.format("ORD%s%s", datePart, idPart);
    }
}
