package com.techstore.entity.product;

import com.techstore.entity.base.BaseEntity;
import com.techstore.entity.brand.Brand;
import com.techstore.entity.category.Category;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "products", indexes = {
        @Index(name = "idx_products_active", columnList = "active"),
        @Index(name = "idx_products_category", columnList = "category_id"),
        @Index(name = "idx_products_brand", columnList = "brand_id"),
        @Index(name = "idx_products_active_created", columnList = "active, created_at"),
        @Index(name = "idx_products_active_category", columnList = "active, category_id"),
        @Index(name = "idx_products_active_brand", columnList = "active, brand_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "category", "brand", "variants", "images", "attributes"})
public class Product extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @org.hibernate.annotations.BatchSize(size = 20)
    @Builder.Default
    private java.util.Set<ProductVariant> variants = new java.util.HashSet<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @org.hibernate.annotations.BatchSize(size = 20)
    @Builder.Default
    private java.util.Set<ProductImage> images = new java.util.HashSet<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @org.hibernate.annotations.BatchSize(size = 20)
    @Builder.Default
    private java.util.Set<ProductAttribute> attributes = new java.util.HashSet<>();

    @org.hibernate.annotations.Formula("(SELECT MIN(v.price) FROM product_variants v WHERE v.product_id = id AND v.active = true)")
    private BigDecimal price;

    @org.hibernate.annotations.Formula("(SELECT COALESCE(SUM(oi.quantity), 0) FROM order_items oi JOIN product_variants v ON oi.variant_id = v.id WHERE v.product_id = id)")
    private Long soldCount;

    @org.hibernate.annotations.Formula("(SELECT COALESCE(SUM(v.stock_quantity), 0) FROM product_variants v WHERE v.product_id = id)")
    private Integer totalStock;

    @org.hibernate.annotations.Formula("(SELECT COALESCE(AVG(r.rating), 0) FROM reviews r WHERE r.product_id = id)")
    private Double rating;
}
