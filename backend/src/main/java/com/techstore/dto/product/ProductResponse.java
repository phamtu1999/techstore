package com.techstore.dto.product;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.techstore.dto.brand.BrandResponse;
import com.techstore.dto.category.CategoryResponse;
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
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProductResponse {
    String id;
    String name;
    String slug;
    String description;
    CategoryResponse category;
    BrandResponse brand;
    List<ProductVariantResponse> variants;
    List<ProductAttributeResponse> attributes;
    List<String> imageUrls;
    BigDecimal price;
    BigDecimal originalPrice;
    String currency;
    BigDecimal minPrice;
    BigDecimal maxPrice;
    Integer variantCount;
    Double rating;
    Long reviewCount;
    Long soldCount;
    Integer discountPercentage;
    Boolean isNew;
    Integer stock;
    Boolean active;
    Instant createdAt;
}
