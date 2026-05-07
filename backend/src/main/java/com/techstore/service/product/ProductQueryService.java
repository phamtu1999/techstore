package com.techstore.service.product;

import com.techstore.dto.PageResponse;
import com.techstore.dto.product.ProductMinResponse;
import com.techstore.dto.product.ProductResponse;
import com.techstore.entity.product.Product;
import com.techstore.exception.AppException;
import com.techstore.exception.ErrorCode;
import com.techstore.repository.product.ProductListingRow;
import com.techstore.repository.product.ProductRepository;
import com.techstore.repository.product.ProductSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductQueryService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    @Cacheable(value = "products_v3", key = "{#query, #category, #brand, #minPrice, #maxPrice, #pageable.pageNumber, #pageable.pageSize, #pageable.sort.toString()}")
    public PageResponse<ProductMinResponse> getProducts(
            String query, String category, String brand,
            BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable
    ) {
        Page<ProductListingRow> productPage = productRepository.findPublicProductListing(
                query, category, brand, minPrice, maxPrice, pageable
        );

        List<ProductMinResponse> content = productPage.getContent().stream()
                .map(productMapper::mapToProductMinResponse)
                .toList();

        Page<ProductMinResponse> page = new PageImpl<>(content, pageable, productPage.getTotalElements());
        return PageResponse.of(page);
    }

    @Cacheable(value = "admin_products_v1", key = "{#query, #category, #brand, #minPrice, #maxPrice, #active, #lowStock, #pageable.pageNumber, #pageable.pageSize, #pageable.sort.toString()}")
    public PageResponse<ProductResponse> getAdminProducts(
            String query, String category, String brand,
            BigDecimal minPrice, BigDecimal maxPrice, 
            Boolean active, Boolean lowStock,
            Pageable pageable
    ) {
        Specification<Product> spec = ProductSpecification.filterProducts(query, category, brand, minPrice, maxPrice, active, lowStock);
        Page<Product> productPage = productRepository.findAll(spec, pageable);

        List<String> productIds = productPage.getContent().stream()
                .map(Product::getId)
                .toList();
        Map<String, Long> reviewCountMap = productMapper.getReviewCountMap(productIds);

        Page<ProductResponse> page = productPage.map(p -> productMapper.mapToProductResponse(p, true, reviewCountMap));
        return PageResponse.of(page);
    }

    @Cacheable(value = "product_detail_v3", key = "#slug")
    public ProductResponse getProductBySlug(String slug) {
        Product product = productRepository.fetchBySlugWithDetails(slug)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_FOUND));

        if (!product.isActive() || (product.getCategory() != null && !product.getCategory().isActive())) {
            throw new AppException(ErrorCode.ENTITY_NOT_FOUND);
        }

        return productMapper.mapToProductResponse(product, true);
    }

    @Cacheable(value = "product_detail_id_v1", key = "#id")
    public ProductResponse getProductById(String id) {
        Product product = productRepository.fetchByIdWithDetails(id)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_FOUND));
        return productMapper.mapToProductResponse(product, true);
    }
}
