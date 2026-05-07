package com.techstore.repository.product;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
public class ProductListingRow {

    private String id;
    private String name;
    private String slug;
    private Instant createdAt;

    private String categoryId;
    private String categoryName;
    private String categorySlug;

    private String brandId;
    private String brandName;
    private String brandSlug;
    private String brandLogoUrl;

    private BigDecimal price = BigDecimal.ZERO;
    private Double rating = 0D;
    private Long reviewCount = 0L;
    private String thumbnailUrl;
    private String defaultVariantId;

    public ProductListingRow(
            String id,
            String name,
            String slug,
            Instant createdAt,
            String categoryId,
            String categoryName,
            String categorySlug,
            String brandId,
            String brandName,
            String brandSlug,
            String brandLogoUrl
    ) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.createdAt = createdAt;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.categorySlug = categorySlug;
        this.brandId = brandId;
        this.brandName = brandName;
        this.brandSlug = brandSlug;
        this.brandLogoUrl = brandLogoUrl;
    }
}
