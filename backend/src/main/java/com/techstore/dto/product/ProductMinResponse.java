package com.techstore.dto.product;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.techstore.dto.brand.BrandResponse;
import com.techstore.dto.category.CategoryResponse;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProductMinResponse {
    String id;
    String name;
    String slug;
    CategoryResponse category;
    BrandResponse brand;
    List<String> imageUrls;
    BigDecimal price;
    BigDecimal originalPrice;
    String currency;
    Double rating;
    Long reviewCount;
    Integer discountPercentage;
    Boolean isNew;
    String defaultVariantId;
}
