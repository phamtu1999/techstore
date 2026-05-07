package com.techstore.repository.product;

import com.techstore.entity.category.Category;
import com.techstore.entity.product.Product;
import com.techstore.entity.product.ProductVariant;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
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
            boolean onlyActive
    ) {
        return (root, criteriaQuery, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Filter by Name and Description (Search) - Enhanced Security
            if (StringUtils.hasText(query)) {
                // Sanitize: remove potentially dangerous SQL characters AND escape LIKE special characters
                String safeQuery = query.trim()
                        .replaceAll("['\";\\\\]", "")
                        .replaceAll("--", "")
                        .replaceAll("%", "\\\\%")   // escape %
                        .replaceAll("_", "\\\\_");  // escape _

                String pattern = "%" + safeQuery.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern, '\\'), 
                        cb.like(cb.lower(root.get("description")), pattern, '\\')
                ));
            }

            // 2. Filter by Category
            Join<Product, Category> categoryJoin = null;
            if (StringUtils.hasText(categorySlug)) {
                categoryJoin = root.join("category");
                String term = categorySlug.trim().toLowerCase();
                predicates.add(cb.or(
                        cb.equal(cb.lower(categoryJoin.get("id")), term),
                        cb.equal(cb.lower(categoryJoin.get("slug")), term)
                ));
            }

            // 3. Filter by Brand
            if (StringUtils.hasText(brandSlug)) {
                var brandJoin = root.join("brand");
                String term = brandSlug.trim().toLowerCase();
                predicates.add(cb.or(
                        cb.equal(cb.lower(brandJoin.get("id")), term),
                        cb.equal(cb.lower(brandJoin.get("slug")), term)
                ));
            }

            // 4. Filter by Price Range using Subquery (Avoids Cartesian product / Duplicates)
            if (minPrice != null || maxPrice != null) {
                var subquery = criteriaQuery.subquery(Long.class);
                var variantRoot = subquery.from(ProductVariant.class);
                
                List<Predicate> pricePreds = new ArrayList<>();
                pricePreds.add(cb.equal(variantRoot.get("product"), root));
                pricePreds.add(cb.isTrue(variantRoot.get("active")));
                
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

            // 5. Visibility filters
            if (onlyActive) {
                predicates.add(cb.isTrue(root.get("active")));
                
                if (categoryJoin == null) {
                    categoryJoin = root.join("category", jakarta.persistence.criteria.JoinType.LEFT);
                }
                
                // ✅ Only filter active if category exists (using LEFT JOIN logic)
                predicates.add(cb.or(
                    cb.isNull(categoryJoin),
                    cb.isTrue(categoryJoin.get("active"))
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
