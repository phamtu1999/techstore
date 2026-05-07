package com.techstore.dto.inventory;

import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimpleProductVariantResponse {
    private String id;
    private String productName;
    private String variantName;
    private String sku;
    private BigDecimal price;
    private BigDecimal costPrice;
    private Integer stockQuantity;
    private Integer lowStockThreshold;
    private String imageUrl;
    private boolean active;
}
