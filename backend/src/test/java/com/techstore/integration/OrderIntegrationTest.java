package com.techstore.integration;

import com.techstore.dto.order.CheckoutRequest;
import com.techstore.entity.brand.Brand;
import com.techstore.entity.category.Category;
import com.techstore.entity.order.Coupon;
import com.techstore.entity.order.DiscountType;
import com.techstore.entity.order.Order;
import com.techstore.entity.order.OrderStatus;
import com.techstore.entity.payment.PaymentMethod;
import com.techstore.entity.product.Product;
import com.techstore.entity.product.ProductVariant;
import com.techstore.entity.user.User;
import com.techstore.exception.AppException;
import com.techstore.exception.ErrorCode;
import com.techstore.repository.brand.BrandRepository;
import com.techstore.repository.category.CategoryRepository;
import com.techstore.repository.order.CouponRepository;
import com.techstore.repository.order.OrderRepository;
import com.techstore.repository.product.ProductRepository;
import com.techstore.repository.product.ProductVariantRepository;
import com.techstore.repository.user.UserRepository;
import com.techstore.service.notification.EmailService;
import com.techstore.service.order.OrderCommandService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class OrderIntegrationTest {


    @Autowired
    private OrderCommandService orderCommandService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductVariantRepository variantRepository;

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private OrderRepository orderRepository;

    @MockBean
    private EmailService emailService;

    @Autowired
    private com.techstore.service.payment.PaymentService paymentService;

    @Autowired
    private com.techstore.repository.payment.PaymentRepository paymentRepository;

    @Autowired
    private com.techstore.config.VnPayConfig vnPayConfig;

    private User testUser;
    private ProductVariant testVariant;

    @BeforeEach
    void setUp() {
        // 1. Setup User
        testUser = userRepository.save(User.builder()
                .email("order@test.com")
                .fullName("Order Tester")
                .password("password")
                .role(com.techstore.entity.user.Role.ROLE_USER)
                .status(com.techstore.entity.user.UserStatus.ACTIVE)
                .active(true)
                .build());

        // 2. Setup Catalog with unique slugs to avoid DataInitializer conflicts
        Brand brand = brandRepository.save(Brand.builder()
                .name("Order Brand")
                .slug("order-brand-" + UUID.randomUUID())
                .build());
        
        Category category = categoryRepository.save(Category.builder()
                .name("Order Category")
                .slug("order-cat-" + UUID.randomUUID())
                .active(true)
                .build());

        Product product = productRepository.save(Product.builder()
                .name("Order Product")
                .slug("order-prod-" + UUID.randomUUID())
                .brand(brand)
                .category(category)
                .active(true)
                .build());

        testVariant = variantRepository.save(ProductVariant.builder()
                .product(product)
                .sku("ORD-SKU-" + UUID.randomUUID())
                .name("Order Variant")
                .price(new BigDecimal("30000000"))
                .stockQuantity(10)
                .active(true)
                .build());

        // 3. Setup Coupon
        couponRepository.save(Coupon.builder()
                .code("ORDER10")
                .discountType(DiscountType.PERCENT)
                .discountValue(new BigDecimal("10"))
                .maxDiscount(new BigDecimal("1000000"))
                .minPurchase(new BigDecimal("10000000"))
                .expirationDate(Instant.now().plus(java.time.Duration.ofDays(7)))
                .usageLimit(100)
                .usedCount(0)
                .active(true)
                .build());
    }

    @Test
    void createOrder_Success_WithCouponAndStockDeduction() {
        CheckoutRequest request = new CheckoutRequest();
        request.setReceiverName("John Doe");
        request.setReceiverPhone("0123456789");
        request.setShippingAddress("123 Order Street");
        request.setIdempotencyKey(UUID.randomUUID().toString());
        request.setCouponCode("ORDER10");
        
        CheckoutRequest.CartItemRequest item = new CheckoutRequest.CartItemRequest();
        item.setVariantId(testVariant.getId());
        item.setQuantity(1);
        request.setItems(List.of(item));

        // Act
        String orderId = orderCommandService.createOrder(testUser, request);

        // Assert Order
        assertNotNull(orderId);
        Order order = orderRepository.findById(orderId).orElseThrow();
        assertEquals(OrderStatus.PENDING, order.getStatus());
        assertEquals(0, new BigDecimal("30000000").compareTo(order.getSubTotal()));
        assertEquals(0, new BigDecimal("1000000").compareTo(order.getDiscountAmount()));
        assertEquals(0, new BigDecimal("29000000").compareTo(order.getTotalAmount()));
        
        // Assert Stock Deduction
        ProductVariant updatedVariant = variantRepository.findById(testVariant.getId()).orElseThrow();
        assertEquals(9, updatedVariant.getStockQuantity());
        
        // Assert Coupon Usage
        Coupon updatedCoupon = couponRepository.findByCodeAndActiveTrue("ORDER10").orElseThrow();
        assertEquals(1, updatedCoupon.getUsedCount());
    }

    @Test
    void createOrder_Fail_WhenInsufficientStock() {
        CheckoutRequest request = new CheckoutRequest();
        request.setIdempotencyKey(UUID.randomUUID().toString());
        
        CheckoutRequest.CartItemRequest item = new CheckoutRequest.CartItemRequest();
        item.setVariantId(testVariant.getId());
        item.setQuantity(11); // Over stock
        request.setItems(List.of(item));

        AppException ex = assertThrows(AppException.class, () -> orderCommandService.createOrder(testUser, request));
        assertEquals(ErrorCode.INSUFFICIENT_STOCK, ex.getErrorCode());
    }

    @Test
    void cancelOrder_ShouldReturnStock() {
        // 1. Create order
        CheckoutRequest request = new CheckoutRequest();
        request.setReceiverName("Canceller");
        request.setReceiverPhone("000");
        request.setShippingAddress("Void");
        request.setIdempotencyKey(UUID.randomUUID().toString());
        CheckoutRequest.CartItemRequest item = new CheckoutRequest.CartItemRequest();
        item.setVariantId(testVariant.getId());
        item.setQuantity(2);
        request.setItems(List.of(item));
        
        String orderId = orderCommandService.createOrder(testUser, request);
        
        // Verify stock deducted
        assertEquals(8, variantRepository.findById(testVariant.getId()).get().getStockQuantity());
        
        // 2. Cancel order
        orderCommandService.cancelOrder(orderId, testUser);
        
        // 3. Verify stock returned
        ProductVariant updatedVariant = variantRepository.findById(testVariant.getId()).orElseThrow();
        assertEquals(10, updatedVariant.getStockQuantity());
        
        Order order = orderRepository.findById(orderId).orElseThrow();
        assertEquals(OrderStatus.CANCELLED, order.getStatus());
    }

    @Test
    void paymentSuccess_ShouldConfirmOrder() {
        // 1. Create order
        CheckoutRequest request = new CheckoutRequest();
        request.setReceiverName("Buyer");
        request.setReceiverPhone("123");
        request.setShippingAddress("Hanoi");
        request.setIdempotencyKey(UUID.randomUUID().toString());
        CheckoutRequest.CartItemRequest item = new CheckoutRequest.CartItemRequest();
        item.setVariantId(testVariant.getId());
        item.setQuantity(1);
        request.setItems(List.of(item));
        
        String orderId = orderCommandService.createOrder(testUser, request);
        
        // 2. Simulate VNPay Success Callback
        String txnRef = orderId + "_123456";
        // Pre-create payment record like the service does
        paymentRepository.save(com.techstore.entity.payment.Payment.builder()
                .order(orderRepository.findById(orderId).get())
                .transactionId(txnRef)
                .amount(new BigDecimal("30000000"))
                .paymentMethod(PaymentMethod.VNPAY)
                .status(com.techstore.entity.payment.PaymentStatus.PENDING)
                .build());

        Map<String, String> params = new java.util.HashMap<>();
        params.put("vnp_TxnRef", txnRef);
        params.put("vnp_ResponseCode", "00");
        params.put("vnp_Amount", "3000000000"); // VNPay amount is x100
        params.put("vnp_BankCode", "NCB");
        params.put("vnp_PayDate", "20240424100000");
        
        // Generate valid hash
        String hashData = com.techstore.utils.VnPayUtils.hashAllFields(params, vnPayConfig.getHashSecret());
        params.put("vnp_SecureHash", hashData);

        // Act
        paymentService.processVnPayReturn(params);

        // Assert
        Order order = orderRepository.findById(orderId).orElseThrow();
        assertEquals(OrderStatus.CONFIRMED, order.getStatus());
        
        com.techstore.entity.payment.Payment payment = paymentRepository.findByTransactionId(txnRef).get();
        assertEquals(com.techstore.entity.payment.PaymentStatus.SUCCESS, payment.getStatus());
    }

    @Test
    void paymentFailure_ShouldKeepOrderPending() {
        // 1. Create order
        CheckoutRequest request = new CheckoutRequest();
        request.setReceiverName("Failing Buyer");
        request.setReceiverPhone("456");
        request.setShippingAddress("SG");
        request.setIdempotencyKey(UUID.randomUUID().toString());
        CheckoutRequest.CartItemRequest item = new CheckoutRequest.CartItemRequest();
        item.setVariantId(testVariant.getId());
        item.setQuantity(1);
        request.setItems(List.of(item));
        
        String orderId = orderCommandService.createOrder(testUser, request);
        String txnRef = orderId + "_999999";
        
        paymentRepository.save(com.techstore.entity.payment.Payment.builder()
                .order(orderRepository.findById(orderId).get())
                .transactionId(txnRef)
                .amount(new BigDecimal("30000000"))
                .paymentMethod(PaymentMethod.VNPAY)
                .status(com.techstore.entity.payment.PaymentStatus.PENDING)
                .build());

        Map<String, String> params = new java.util.HashMap<>();
        params.put("vnp_TxnRef", txnRef);
        params.put("vnp_ResponseCode", "05"); // Transaction error
        params.put("vnp_Amount", "3000000000");
        
        String hashData = com.techstore.utils.VnPayUtils.hashAllFields(params, vnPayConfig.getHashSecret());
        params.put("vnp_SecureHash", hashData);

        // Act
        paymentService.processVnPayReturn(params);

        // Assert
        Order order = orderRepository.findById(orderId).orElseThrow();
        assertEquals(OrderStatus.PENDING, order.getStatus()); // Stays pending
        
        com.techstore.entity.payment.Payment payment = paymentRepository.findByTransactionId(txnRef).get();
        assertEquals(com.techstore.entity.payment.PaymentStatus.FAILED, payment.getStatus());
    }
}
