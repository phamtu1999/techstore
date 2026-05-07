package com.techstore.dto.order;

import com.techstore.entity.order.OrderStatus;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderResponse {
    String id;
    String orderNumber;
    String receiverName;
    String receiverPhone;
    String receiverEmail;
    String shippingAddress;
    BigDecimal subTotal;
    BigDecimal shippingFee;
    BigDecimal discountAmount;
    BigDecimal totalAmount;
    OrderStatus status;
    Boolean canCancel;
    String note;
    Integer pointsSpent;
    Integer pointsEarned;
    Instant createdAt;
    String paymentMethod;
    List<OrderItemResponse> items;
    List<OrderHistoryResponse> timeline;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class OrderItemResponse {
        String id;
        String variantId;
        String productId;
        String productName;
        String variantName;
        String variantSku;
        String imageUrl;
        BigDecimal priceAtPurchase;
        Integer quantity;
    }
}
