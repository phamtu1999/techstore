package com.techstore.repository.product;

import com.techstore.entity.brand.Brand;
import com.techstore.entity.category.Category;
import com.techstore.entity.product.Product;
import com.techstore.entity.product.ProductImage;
import com.techstore.entity.product.ProductVariant;
import com.techstore.entity.review.Review;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.Tuple;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Repository
public class ProductRepositoryImpl implements ProductListingRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Page<ProductListingRow> findPublicProductListing(
            String query,
            String categorySlug,
            String brandSlug,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Pageable pageable
    ) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();

        CriteriaQuery<ProductListingRow> contentQuery = cb.createQuery(ProductListingRow.class);
        Root<Product> productRoot = contentQuery.from(Product.class);
        Join<Product, Category> categoryJoin = productRoot.join("category", JoinType.INNER);
        Join<Product, Brand> brandJoin = productRoot.join("brand", JoinType.INNER);

        List<Predicate> predicates = buildListingPredicates(
                query, categorySlug, brandSlug, minPrice, maxPrice,
                productRoot, categoryJoin, brandJoin, contentQuery, cb
        );

        contentQuery.select(cb.construct(
                ProductListingRow.class,
                productRoot.get("id"),
                productRoot.get("name"),
                productRoot.get("slug"),
                productRoot.get("createdAt"),
                categoryJoin.get("id"),
                categoryJoin.get("name"),
                categoryJoin.get("slug"),
                brandJoin.get("id"),
                brandJoin.get("name"),
                brandJoin.get("slug"),
                brandJoin.get("logoUrl")
        ));
        contentQuery.where(predicates.toArray(new Predicate[0]));

        List<Order> sortOrders = buildSortOrders(pageable.getSort(), productRoot, categoryJoin, brandJoin, contentQuery, cb);
        if (!sortOrders.isEmpty()) {
            contentQuery.orderBy(sortOrders);
        }

        TypedQuery<ProductListingRow> typedQuery = entityManager.createQuery(contentQuery);
        typedQuery.setFirstResult((int) pageable.getOffset());
        typedQuery.setMaxResults(pageable.getPageSize());

        List<ProductListingRow> rows = typedQuery.getResultList();
        enrichListingRows(rows);

        long total = countListingResults(query, categorySlug, brandSlug, minPrice, maxPrice);
        return new PageImpl<>(rows, pageable, total);
    }

    private long countListingResults(
            String query,
            String categorySlug,
            String brandSlug,
            BigDecimal minPrice,
            BigDecimal maxPrice
    ) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<Product> productRoot = countQuery.from(Product.class);
        Join<Product, Category> categoryJoin = productRoot.join("category", JoinType.INNER);
        Join<Product, Brand> brandJoin = productRoot.join("brand", JoinType.INNER);

        List<Predicate> predicates = buildListingPredicates(
                query, categorySlug, brandSlug, minPrice, maxPrice,
                productRoot, categoryJoin, brandJoin, countQuery, cb
        );

        countQuery.select(cb.count(productRoot));
        countQuery.where(predicates.toArray(new Predicate[0]));

        return entityManager.createQuery(countQuery).getSingleResult();
    }

    private List<Predicate> buildListingPredicates(
            String query,
            String categorySlug,
            String brandSlug,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Root<Product> productRoot,
            Join<Product, Category> categoryJoin,
            Join<Product, Brand> brandJoin,
            CriteriaQuery<?> criteriaQuery,
            CriteriaBuilder cb
    ) {
        List<Predicate> predicates = new ArrayList<>();

        String safeQuery = sanitizeSearchTerm(query);
        if (StringUtils.hasText(safeQuery)) {
            String pattern = "%" + safeQuery.toLowerCase(Locale.ROOT) + "%";
            predicates.add(cb.or(
                    cb.like(cb.lower(productRoot.get("name")), pattern, '\\'),
                    cb.like(cb.lower(productRoot.get("description")), pattern, '\\')
            ));
        }

        if (StringUtils.hasText(categorySlug)) {
            String term = categorySlug.trim().toLowerCase(Locale.ROOT);
            predicates.add(cb.or(
                    cb.equal(cb.lower(categoryJoin.get("id")), term),
                    cb.equal(cb.lower(categoryJoin.get("slug")), term)
            ));
        }

        if (StringUtils.hasText(brandSlug)) {
            String term = brandSlug.trim().toLowerCase(Locale.ROOT);
            predicates.add(cb.or(
                    cb.equal(cb.lower(brandJoin.get("id")), term),
                    cb.equal(cb.lower(brandJoin.get("slug")), term)
            ));
        }

        if (minPrice != null || maxPrice != null) {
            Subquery<String> subquery = criteriaQuery.subquery(String.class);
            Root<ProductVariant> variantRoot = subquery.from(ProductVariant.class);

            List<Predicate> pricePredicates = new ArrayList<>();
            pricePredicates.add(cb.equal(variantRoot.get("product"), productRoot));
            pricePredicates.add(cb.isTrue(variantRoot.get("active")));

            if (minPrice != null) {
                pricePredicates.add(cb.greaterThanOrEqualTo(variantRoot.get("price"), minPrice));
            }
            if (maxPrice != null) {
                pricePredicates.add(cb.lessThanOrEqualTo(variantRoot.get("price"), maxPrice));
            }

            subquery.select(variantRoot.get("id"))
                    .where(pricePredicates.toArray(new Predicate[0]));
            predicates.add(cb.exists(subquery));
        }

        predicates.add(cb.isTrue(productRoot.get("active")));
        predicates.add(cb.isTrue(categoryJoin.get("active")));
        return predicates;
    }

    private List<Order> buildSortOrders(
            Sort sort,
            Root<Product> productRoot,
            Join<Product, Category> categoryJoin,
            Join<Product, Brand> brandJoin,
            CriteriaQuery<?> criteriaQuery,
            CriteriaBuilder cb
    ) {
        List<Order> orders = new ArrayList<>();
        for (Sort.Order sortOrder : sort) {
            Expression<? extends Comparable<?>> expression = resolveSortExpression(
                    sortOrder.getProperty(), productRoot, categoryJoin, brandJoin, criteriaQuery, cb
            );
            if (expression == null) {
                continue;
            }
            orders.add(sortOrder.isAscending() ? cb.asc(expression) : cb.desc(expression));
        }
        return orders;
    }

    private Expression<? extends Comparable<?>> resolveSortExpression(
            String property,
            Root<Product> productRoot,
            Join<Product, Category> categoryJoin,
            Join<Product, Brand> brandJoin,
            CriteriaQuery<?> criteriaQuery,
            CriteriaBuilder cb
    ) {
        return switch (property) {
            case "category", "categoryName" -> categoryJoin.get("name");
            case "brand", "brandName" -> brandJoin.get("name");
            case "price" -> buildMinPriceExpression(productRoot, criteriaQuery, cb);
            case "rating" -> buildRatingExpression(productRoot, criteriaQuery, cb);
            case "reviewCount" -> buildReviewCountExpression(productRoot, criteriaQuery, cb);
            default -> {
                try {
                    yield productRoot.get(property);
                } catch (IllegalArgumentException ex) {
                    yield null;
                }
            }
        };
    }

    private Expression<BigDecimal> buildMinPriceExpression(
            Root<Product> productRoot,
            CriteriaQuery<?> criteriaQuery,
            CriteriaBuilder cb
    ) {
        Subquery<BigDecimal> subquery = criteriaQuery.subquery(BigDecimal.class);
        Root<ProductVariant> variantRoot = subquery.from(ProductVariant.class);
        subquery.select(cb.min(variantRoot.get("price")))
                .where(
                        cb.equal(variantRoot.get("product"), productRoot),
                        cb.isTrue(variantRoot.get("active"))
                );
        return cb.coalesce(subquery, BigDecimal.ZERO);
    }

    private Expression<Double> buildRatingExpression(
            Root<Product> productRoot,
            CriteriaQuery<?> criteriaQuery,
            CriteriaBuilder cb
    ) {
        Subquery<Double> subquery = criteriaQuery.subquery(Double.class);
        Root<Review> reviewRoot = subquery.from(Review.class);
        subquery.select(cb.coalesce(cb.avg(reviewRoot.get("rating")), 0D))
                .where(cb.equal(reviewRoot.get("product"), productRoot));
        return cb.coalesce(subquery, 0D);
    }

    private Expression<Long> buildReviewCountExpression(
            Root<Product> productRoot,
            CriteriaQuery<?> criteriaQuery,
            CriteriaBuilder cb
    ) {
        Subquery<Long> subquery = criteriaQuery.subquery(Long.class);
        Root<Review> reviewRoot = subquery.from(Review.class);
        subquery.select(cb.count(reviewRoot))
                .where(cb.equal(reviewRoot.get("product"), productRoot));
        return cb.coalesce(subquery, 0L);
    }

    private void enrichListingRows(List<ProductListingRow> rows) {
        if (rows.isEmpty()) {
            return;
        }

        List<String> productIds = rows.stream()
                .map(ProductListingRow::getId)
                .toList();

        Map<String, BigDecimal> priceMap = fetchMinPriceMap(productIds);
        Map<String, Tuple> reviewSummaryMap = fetchReviewSummaryMap(productIds);
        Map<String, String> thumbnailMap = fetchThumbnailMap(productIds);
        Map<String, String> variantMap = fetchDefaultVariantIdMap(productIds);

        for (ProductListingRow row : rows) {
            row.setPrice(priceMap.getOrDefault(row.getId(), BigDecimal.ZERO));

            Tuple reviewSummary = reviewSummaryMap.get(row.getId());
            if (reviewSummary != null) {
                row.setRating(reviewSummary.get("rating", Double.class));
                row.setReviewCount(reviewSummary.get("reviewCount", Long.class));
            }

            row.setThumbnailUrl(thumbnailMap.get(row.getId()));
            row.setDefaultVariantId(variantMap.get(row.getId()));
        }
    }

    private Map<String, String> fetchDefaultVariantIdMap(List<String> productIds) {
        List<Tuple> tuples = entityManager.createQuery("""
                SELECT v.product.id AS productId, v.id AS variantId
                FROM ProductVariant v
                WHERE v.active = true AND v.product.id IN :productIds
                ORDER BY v.id ASC
                """, Tuple.class)
                .setParameter("productIds", productIds)
                .getResultList();

        Map<String, String> result = new HashMap<>();
        for (Tuple tuple : tuples) {
            String productId = tuple.get("productId", String.class);
            // Only put if not already present (take the first variant found by ID)
            result.putIfAbsent(productId, tuple.get("variantId", String.class));
        }
        return result;
    }

    private Map<String, BigDecimal> fetchMinPriceMap(List<String> productIds) {
        List<Tuple> tuples = entityManager.createQuery("""
                SELECT v.product.id AS productId, MIN(v.price) AS minPrice
                FROM ProductVariant v
                WHERE v.active = true AND v.product.id IN :productIds
                GROUP BY v.product.id
                """, Tuple.class)
                .setParameter("productIds", productIds)
                .getResultList();

        Map<String, BigDecimal> result = new HashMap<>();
        for (Tuple tuple : tuples) {
            result.put(tuple.get("productId", String.class), tuple.get("minPrice", BigDecimal.class));
        }
        return result;
    }

    private Map<String, Tuple> fetchReviewSummaryMap(List<String> productIds) {
        List<Tuple> tuples = entityManager.createQuery("""
                SELECT r.product.id AS productId,
                       COALESCE(AVG(r.rating), 0D) AS rating,
                       COUNT(r) AS reviewCount
                FROM Review r
                WHERE r.product.id IN :productIds
                GROUP BY r.product.id
                """, Tuple.class)
                .setParameter("productIds", productIds)
                .getResultList();

        Map<String, Tuple> result = new HashMap<>();
        for (Tuple tuple : tuples) {
            result.put(tuple.get("productId", String.class), tuple);
        }
        return result;
    }

    private Map<String, String> fetchThumbnailMap(List<String> productIds) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Tuple> query = cb.createTupleQuery();
        Root<ProductImage> imageRoot = query.from(ProductImage.class);

        Expression<String> thumbnailExpression = cb.greatest(
                cb.<String>selectCase()
                        .when(cb.isTrue(imageRoot.get("isThumbnail")), imageRoot.get("imageUrl"))
                        .otherwise((String) null)
        );

        query.multiselect(
                imageRoot.get("product").get("id").alias("productId"),
                cb.coalesce(thumbnailExpression, cb.least(imageRoot.<String>get("imageUrl"))).alias("imageUrl")
        );
        query.where(imageRoot.get("product").get("id").in(productIds));
        query.groupBy(imageRoot.get("product").get("id"));

        List<Tuple> tuples = entityManager.createQuery(query).getResultList();

        Map<String, String> result = new HashMap<>();
        for (Tuple tuple : tuples) {
            result.put(tuple.get("productId", String.class), tuple.get("imageUrl", String.class));
        }
        return result;
    }

    private String sanitizeSearchTerm(String query) {
        if (!StringUtils.hasText(query)) {
            return null;
        }

        return query.trim()
                .replaceAll("['\";\\\\]", "")
                .replaceAll("--", "")
                .replace("%", "\\%")
                .replace("_", "\\_");
    }
}
