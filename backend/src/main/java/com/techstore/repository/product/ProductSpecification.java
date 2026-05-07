package com.techstore.repository.product;

import com.techstore.entity.category.Category;
import com.techstore.entity.product.Product;
import com.techstore.entity.product.ProductVariant;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ProductSpecification {

    public static Specification<Product> filterProducts(
            String query,
            String categorySlug,
            String brandSlug,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Boolean active,
            Boolean lowStock
    ) {
        return (root, criteriaQuery, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Filter by Name and Description (Search)
            if (StringUtils.hasText(query)) {
                String safeQuery = query.trim()
                        .replaceAll("['\";\\\\]", "")
                        .replaceAll("--", "")
                        .replaceAll("%", "\\\\%")
                        .replaceAll("_", "\\\\_");

                String pattern = "%" + safeQuery.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern, '\\'), 
                        cb.like(cb.lower(root.get("description")), pattern, '\\')
                ));
            }

            // 2. Filter by Category (Support both ID and Slug)
            if (StringUtils.hasText(categorySlug)) {
                Join<Product, Category> categoryJoin = root.join("category");
                String term = categorySlug.trim().toLowerCase();
                predicates.add(cb.or(
                        cb.equal(cb.lower(categoryJoin.get("id")), term),
                        cb.equal(cb.lower(categoryJoin.get("slug")), term)
                ));
            }

            // 3. Filter by Brand (Support both ID and Slug)
            if (StringUtils.hasText(brandSlug)) {
                var brandJoin = root.join("brand");
                String term = brandSlug.trim().toLowerCase();
                predicates.add(cb.or(
                        cb.equal(cb.lower(brandJoin.get("id")), term),
                        cb.equal(cb.lower(brandJoin.get("slug")), term)
                ));
            }

            // 4. Filter by Price Range using Subquery
            if (minPrice != null || maxPrice != null) {
                Subquery<String> subquery = criteriaQuery.subquery(String.class);
                Root<ProductVariant> variantRoot = subquery.from(ProductVariant.class);
                
                List<Predicate> pricePreds = new ArrayList<>();
                pricePreds.add(cb.equal(variantRoot.get("product"), root));
                
                if (minPrice != null) {
                    pricePreds.add(cb.greaterThanOrEqualTo(variantRoot.get("price"), minPrice));
                }
                if (maxPrice != null) {
                    pricePreds.add(cb.lessThanOrEqualTo(variantRoot.get("price"), maxPrice));
                }
                
                subquery.select(variantRoot.get("id"))
                        .where(pricePreds.toArray(new Predicate[0]));
                
                predicates.add(cb.exists(subquery));
            }

            // 5. Filter by Active status
            if (active != null) {
                predicates.add(cb.equal(root.get("active"), active));
            }

            // 6. Filter by Low Stock
            if (lowStock != null && lowStock) {
                Subquery<Long> sumSubquery = criteriaQuery.subquery(Long.class);
                Root<ProductVariant> variantRoot = sumSubquery.from(ProductVariant.class);
                sumSubquery.select(cb.sum(variantRoot.get("stockQuantity")))
                        .where(cb.equal(variantRoot.get("product"), root));
                predicates.add(cb.lessThanOrEqualTo(cb.coalesce(sumSubquery, 0L), 10L));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
