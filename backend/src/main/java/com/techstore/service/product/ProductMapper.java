package com.techstore.service.product;

import com.techstore.dto.brand.BrandResponse;
import com.techstore.dto.category.CategoryResponse;
import com.techstore.dto.product.ProductAttributeResponse;
import com.techstore.dto.product.ProductMinResponse;
import com.techstore.dto.product.ProductResponse;
import com.techstore.dto.product.ProductVariantResponse;
import com.techstore.entity.product.Product;
import com.techstore.entity.product.ProductAttribute;
import com.techstore.entity.product.ProductImage;
import com.techstore.entity.product.ProductVariant;
import com.techstore.repository.product.ProductListingRow;
import com.techstore.repository.review.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ProductMapper {

    private final ReviewRepository reviewRepository;

    public ProductResponse mapToProductResponse(Product product) {
        return mapToProductResponse(product, false);
    }

    public ProductResponse mapToProductResponse(Product product, boolean isDetail) {
        Map<String, Long> map = getReviewCountMap(List.of(product.getId()));
        return mapToProductResponse(product, isDetail, map);
    }

    public ProductResponse mapToProductResponse(Product product, boolean isDetail, Map<String, Long> reviewCountMap) {
        BigDecimal displayPrice = product.getPrice() == null ? BigDecimal.ZERO : product.getPrice();
        double averageRating = product.getRating() == null ? 0D : product.getRating();
        long soldCount = product.getSoldCount() == null ? 0L : product.getSoldCount();
        long reviewCount = reviewCountMap.getOrDefault(product.getId(), 0L);

        String description = product.getDescription();
        if (!isDetail && description != null && description.length() > 150) {
            description = description.substring(0, 147) + "...";
        }

        BigDecimal minPrice = displayPrice;
        BigDecimal maxPrice = displayPrice;
        List<ProductVariantResponse> variantResponses = null;
        int variantCount = 0;
        int totalStock = 0;
        
        if (product.getVariants() != null) {
            totalStock = product.getVariants().stream()
                    .mapToInt(v -> v.getStockQuantity() == null ? 0 : v.getStockQuantity())
                    .sum();
            variantCount = product.getVariants().size();
        }

        ProductResponse.ProductResponseBuilder builder = ProductResponse.builder();

        List<ProductVariant> allVisibleVariants = isDetail ? getVisibleVariants(product) : List.of();
        if (!allVisibleVariants.isEmpty()) {
            BigDecimal repOriginalPrice = allVisibleVariants.get(0).getOriginalPrice();
            if (repOriginalPrice != null && repOriginalPrice.compareTo(displayPrice) > 0) {
                builder.originalPrice(repOriginalPrice);
                double discount = repOriginalPrice.subtract(displayPrice)
                        .movePointRight(2)
                        .divide(repOriginalPrice, 0, java.math.RoundingMode.HALF_UP).doubleValue();
                builder.discountPercentage((int) discount);
            }
        }

        if (isDetail) {
            variantCount = allVisibleVariants.size();
            minPrice = allVisibleVariants.stream()
                    .map(ProductVariant::getPrice)
                    .min(Comparator.naturalOrder())
                    .orElse(displayPrice);
            maxPrice = allVisibleVariants.stream()
                    .map(ProductVariant::getPrice)
                    .max(Comparator.naturalOrder())
                    .orElse(displayPrice);

            variantResponses = allVisibleVariants.stream()
                    .map(v -> ProductVariantResponse.builder()
                            .id(v.getId()).sku(v.getSku()).name(v.getName())
                            .price(v.getPrice())
                            .originalPrice(v.getOriginalPrice())
                            .stockQuantity(v.getStockQuantity())
                            .color(v.getColor()).size(v.getSize())
                            .build())
                    .collect(Collectors.toList());
        }

        builder.id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .description(description)
                .price(displayPrice)
                .currency("VND")
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .variantCount(variantCount)
                .stock(totalStock)
                .rating(averageRating)
                .reviewCount(reviewCount)
                .soldCount(soldCount)
                .isNew(product.getCreatedAt() != null && product.getCreatedAt().isAfter(java.time.LocalDateTime.now().minusDays(30)))
                .active(product.isActive())
                .createdAt(product.getCreatedAt());

        if (variantResponses != null) {
            builder.variants(variantResponses);
        }

        if (product.getBrand() != null) {
            builder.brand(BrandResponse.builder()
                    .id(product.getBrand().getId())
                    .name(product.getBrand().getName())
                    .slug(product.getBrand().getSlug())
                    .logoUrl(product.getBrand().getLogoUrl() != null ? product.getBrand().getLogoUrl().replace("http://", "https://") : null)
                    .build());
        }

        if (product.getCategory() != null) {
            builder.category(CategoryResponse.builder()
                    .id(product.getCategory().getId())
                    .name(product.getCategory().getName())
                    .slug(product.getCategory().getSlug())
                    .build());
        }

        if (isDetail && product.getAttributes() != null) {
            builder.attributes(product.getAttributes().stream()
                    .sorted(Comparator.comparing(ProductAttribute::getAttributeName, Comparator.nullsLast(String::compareToIgnoreCase)))
                    .map(attr -> ProductAttributeResponse.builder().name(attr.getAttributeName()).value(attr.getAttributeValue()).build())
                    .collect(Collectors.toList()));
        }

        if (product.getImages() != null) {
            java.util.stream.Stream<ProductImage> imageStream = product.getImages().stream()
                    .sorted(Comparator.comparing(ProductImage::isThumbnail).reversed());

            if (!isDetail) imageStream = imageStream.limit(1);

            builder.imageUrls(imageStream
                    .map(img -> img.getImageUrl() != null ? img.getImageUrl().replace("http://", "https://") : null)
                    .filter(java.util.Objects::nonNull)
                    .collect(Collectors.toList()));
        }

        return builder.build();
    }

    public ProductMinResponse mapToProductMinResponse(Product product, Map<String, Long> reviewCountMap) {
        BigDecimal displayPrice = product.getPrice() == null ? BigDecimal.ZERO : product.getPrice();
        double averageRating = product.getRating() == null ? 0D : product.getRating();
        long reviewCount = reviewCountMap.getOrDefault(product.getId(), 0L);

        ProductMinResponse.ProductMinResponseBuilder builder = ProductMinResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .price(displayPrice)
                .currency("VND")
                .rating(averageRating)
                .reviewCount(reviewCount)
                .defaultVariantId(getVisibleVariants(product).stream().findFirst().map(ProductVariant::getId).orElse(null))
                .isNew(product.getCreatedAt() != null && product.getCreatedAt().isAfter(java.time.LocalDateTime.now().minusDays(30)));

        if (product.getBrand() != null) {
            builder.brand(BrandResponse.builder()
                    .id(product.getBrand().getId())
                    .name(product.getBrand().getName())
                    .slug(product.getBrand().getSlug())
                    .logoUrl(product.getBrand().getLogoUrl() != null ? product.getBrand().getLogoUrl().replace("http://", "https://") : null)
                    .build());
        }

        if (product.getCategory() != null) {
            builder.category(CategoryResponse.builder()
                    .id(product.getCategory().getId())
                    .name(product.getCategory().getName())
                    .slug(product.getCategory().getSlug())
                    .build());
        }

        if (product.getImages() != null && !product.getImages().isEmpty()) {
            builder.imageUrls(product.getImages().stream()
                    .sorted(Comparator.comparing(ProductImage::isThumbnail).reversed())
                    .limit(1)
                    .map(img -> img.getImageUrl() != null ? img.getImageUrl().replace("http://", "https://") : null)
                    .filter(java.util.Objects::nonNull)
                    .collect(Collectors.toList()));
        }

        return builder.build();
    }

    public ProductMinResponse mapToProductMinResponse(ProductListingRow product) {
        ProductMinResponse.ProductMinResponseBuilder builder = ProductMinResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .price(product.getPrice() == null ? BigDecimal.ZERO : product.getPrice())
                .currency("VND")
                .rating(product.getRating() == null ? 0D : product.getRating())
                .reviewCount(product.getReviewCount() == null ? 0L : product.getReviewCount())
                .defaultVariantId(product.getDefaultVariantId())
                .isNew(product.getCreatedAt() != null && product.getCreatedAt().isAfter(java.time.LocalDateTime.now().minusDays(30)));

        if (StringUtils.hasText(product.getBrandId())) {
            builder.brand(BrandResponse.builder()
                    .id(product.getBrandId())
                    .name(product.getBrandName())
                    .slug(product.getBrandSlug())
                    .logoUrl(product.getBrandLogoUrl() != null ? product.getBrandLogoUrl().replace("http://", "https://") : null)
                    .build());
        }

        if (StringUtils.hasText(product.getCategoryId())) {
            builder.category(CategoryResponse.builder()
                    .id(product.getCategoryId())
                    .name(product.getCategoryName())
                    .slug(product.getCategorySlug())
                    .build());
        }

        if (StringUtils.hasText(product.getThumbnailUrl())) {
            builder.imageUrls(List.of(product.getThumbnailUrl().replace("http://", "https://")));
        }

        return builder.build();
    }

    private List<ProductVariant> getVisibleVariants(Product product) {
        if (product.getVariants() == null || product.getVariants().isEmpty()) return List.of();
        return product.getVariants().stream()
                .filter(ProductVariant::isActive)
                .collect(Collectors.toList());
    }

    public Map<String, Long> getReviewCountMap(List<String> productIds) {
        if (productIds == null || productIds.isEmpty()) return Map.of();
        return reviewRepository.countByProductIdIn(productIds).stream()
                .collect(Collectors.toMap(row -> (String) row[0], row -> ((Number) row[1]).longValue()));
    }
}
