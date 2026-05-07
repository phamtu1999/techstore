package com.techstore.dto.promotion;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FlashSaleResponse {
    String id;
    String name;
    Instant startDate;
    Instant endDate;
    boolean active;
    List<FlashSaleItemResponse> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class FlashSaleItemResponse {
        String id;
        String productId;
        String productName;
        String productImageUrl;
        String variantId;
        String variantName;
        BigDecimal originalPrice;
        BigDecimal salePrice;
        int stockLimit;
        int soldCount;
    }
}
