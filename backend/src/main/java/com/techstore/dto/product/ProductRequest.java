package com.techstore.dto.product;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductRequest {
    String name;
    String description;
    String categoryId;
    String brandId;
    String brandName;
    String slug;
    Boolean active;
    List<VariantRequest> variants;
    List<AttributeRequest> attributes;
    List<String> imageUrls;

    @Data
    public static class VariantRequest {
        String id;
        String sku;
        String name;
        BigDecimal price;
        BigDecimal originalPrice;
        Integer stockQuantity;
        String color;
        String size;
        Integer sortOrder;
    }

    @Data
    public static class AttributeRequest {
        String name;
        String value;
    }
}
