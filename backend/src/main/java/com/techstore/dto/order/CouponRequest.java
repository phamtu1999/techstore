package com.techstore.dto.order;

import com.techstore.entity.order.DiscountType;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponRequest {
    @NotBlank(message = "Coupon code is required")
    private String code;

    @NotNull(message = "Discount type is required")
    private DiscountType discountType;

    @NotNull(message = "Discount value is required")
    @Min(value = 0, message = "Discount value must be positive")
    private BigDecimal discountValue;

    @Builder.Default
    private BigDecimal minPurchase = BigDecimal.ZERO;

    private BigDecimal maxDiscount;

    @NotNull(message = "Expiration date is required")
    @Future(message = "Expiration date must be in the future")
    private Instant expirationDate;

    @Builder.Default
    private Integer usageLimit = 0;

    @Builder.Default
    private boolean active = true;
}
