package com.techstore.service.product;

import com.techstore.dto.product.ProductRequest;
import com.techstore.entity.brand.Brand;
import com.techstore.entity.category.Category;
import com.techstore.entity.product.Product;
import com.techstore.entity.product.ProductAttribute;
import com.techstore.entity.product.ProductImage;
import com.techstore.entity.product.ProductVariant;
import com.techstore.exception.AppException;
import com.techstore.exception.ErrorCode;
import com.techstore.repository.brand.BrandRepository;
import com.techstore.repository.category.CategoryRepository;
import com.techstore.repository.product.ProductRepository;
import com.techstore.utils.SlugUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ProductAdminService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;

    @Transactional
    @CacheEvict(value = {"products_v3", "admin_products_v1", "product_detail_v3", "product_detail_id_v1", "brands"}, allEntries = true)
    public void createProduct(ProductRequest request) {
        // 1. Validate Category & Brand
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_FOUND));
        Brand brand = resolveBrand(request);

        // 2. Create and Save Product
        Product product = Product.builder()
                .name(request.getName())
                .slug(resolveSlug(request, category))
                .description(request.getDescription())
                .category(category)
                .brand(brand)
                .active(request.getActive() == null || request.getActive())
                .variants(new HashSet<>())
                .attributes(new HashSet<>())
                .images(new HashSet<>())
                .build();

        // 3. Add Variants
        if (request.getVariants() != null) {
            for (ProductRequest.VariantRequest vReq : request.getVariants()) {
                ProductVariant variant = ProductVariant.builder()
                        .product(product)
                        .sku(vReq.getSku())
                        .name(vReq.getName())
                        .price(vReq.getPrice())
                        .originalPrice(vReq.getOriginalPrice())
                        .stockQuantity(vReq.getStockQuantity())
                        .color(vReq.getColor())
                        .size(vReq.getSize())
                        .sortOrder(vReq.getSortOrder())
                        .build();
                product.getVariants().add(variant);
            }
        }

        // 4. Add Attributes
        if (request.getAttributes() != null) {
            for (ProductRequest.AttributeRequest aReq : request.getAttributes()) {
                ProductAttribute attribute = ProductAttribute.builder()
                        .product(product)
                        .attributeName(aReq.getName())
                        .attributeValue(aReq.getValue())
                        .build();
                product.getAttributes().add(attribute);
            }
        }

        // 5. Add Images
        if (request.getImageUrls() != null) {
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                ProductImage image = ProductImage.builder()
                        .product(product)
                        .imageUrl(request.getImageUrls().get(i))
                        .isThumbnail(i == 0) // First image is thumbnail by default
                        .build();
                product.getImages().add(image);
            }
        }

        // 6. Save Everything (CascadeType.ALL will handle child entities)
        productRepository.save(product);
    }

    @Transactional
    @CacheEvict(value = {"products_v3", "admin_products_v1", "product_detail_v3", "product_detail_id_v1", "brands"}, allEntries = true)
    public void updateProduct(String id, ProductRequest request) {
        log.info("Bắt đầu cập nhật sản phẩm ID: {}", id);
        
        // 0. Kiểm tra ID đầu vào
        if (id == null || id.isBlank()) {
            throw new AppException(ErrorCode.INVALID_PRODUCT_ID);
        }

        // 1. Find Product
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_FOUND));

        // 2. Validate Category & Brand
        if (request.getCategoryId() == null || request.getCategoryId().isBlank()) {
            throw new AppException(ErrorCode.INVALID_CATEGORY_ID);
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_FOUND));
        Brand brand = resolveBrand(request);

        // 3. Update basic fields
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setCategory(category);
        product.setBrand(brand);
        product.setActive(request.getActive() == null || request.getActive());

        // 4. Update child collections
        syncVariants(product, request.getVariants());
        syncAttributes(product, request.getAttributes());
        syncImages(product, request.getImageUrls());

        // 5. Kiểm tra trùng Slug trước khi lưu
        String newSlug = resolveSlug(request, category);
        productRepository.findBySlug(newSlug).ifPresent(p -> {
            if (!p.getId().equals(product.getId())) {
                throw new AppException(ErrorCode.SLUG_ALREADY_EXISTS);
            }
        });
        product.setSlug(newSlug);

        if (product.getVariants() == null || product.getVariants().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST_FIELD);
        }

        // 6. Save updated product với Log chi tiết
        try {
            productRepository.save(product);
        } catch (Exception e) {
            log.error("LỖI KHI LƯU SẢN PHẨM Product ID {}: {}", id, e.getMessage());
            if (e.getCause() != null) {
                log.error("NGUYÊN NHÂN GỐC: {}", e.getCause().getMessage());
            }
            throw e;
        }
    }

    @Transactional
    @CacheEvict(value = {"products_v3", "admin_products_v1", "product_detail_v3", "product_detail_id_v1", "brands"}, allEntries = true)
    public void deleteProduct(String id) {
        if (!productRepository.existsById(id)) {
            throw new AppException(ErrorCode.ENTITY_NOT_FOUND);
        }
        productRepository.deleteById(id);
    }

    @Transactional
    @CacheEvict(value = {"products_v3", "admin_products_v1", "product_detail_v3", "product_detail_id_v1", "brands"}, allEntries = true)
    public void toggleStatus(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_FOUND));
        product.setActive(!product.isActive());
        productRepository.save(product);
    }

    private Brand resolveBrand(ProductRequest request) {
        if (request.getBrandId() != null && !request.getBrandId().isBlank()) {
            return brandRepository.findById(request.getBrandId())
                    .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_FOUND));
        }

        if (request.getBrandName() != null && !request.getBrandName().isBlank()) {
            return brandRepository.findByName(request.getBrandName())
                    .orElseGet(() -> brandRepository.save(Brand.builder()
                            .name(request.getBrandName())
                            .slug(SlugUtils.makeSlug(request.getBrandName()))
                            .build()));
        }

        throw new AppException(ErrorCode.ENTITY_NOT_FOUND);
    }

    private String resolveSlug(ProductRequest request, Category category) {
        if (request.getSlug() != null && !request.getSlug().isBlank()) {
            return SlugUtils.makeSlug(request.getSlug());
        }
        
        // SEO optimization: Prepend parent category if helpful (e.g., "Điện thoại")
        String prefix = category.getName();
        if (category.getParent() != null && !category.getParent().getSlug().equals("dien-tu")) {
            prefix = category.getParent().getName() + " " + prefix;
        }
        
        String slugInput = prefix + " " + request.getName();
        String slug = SlugUtils.makeSlug(slugInput);
        
        // Deduplicate adjacent identical tokens (e.g., laptop-laptop-dell -> laptop-dell)
        return SlugUtils.deduplicate(slug);
    }

    private void syncVariants(Product product, List<ProductRequest.VariantRequest> variantRequests) {
        if (variantRequests == null || variantRequests.isEmpty()) {
            // Không xóa nếu đã có đơn hàng (hoặc xử lý an toàn hơn ở đây)
            product.getVariants().clear();
            return;
        }

        // Ưu tiên Map theo ID để tránh xóa nhầm bản ghi đang được tham chiếu
        Map<String, ProductVariant> existingVariantsMap = product.getVariants().stream()
                .collect(Collectors.toMap(ProductVariant::getId, v -> v));

        Set<String> processedIds = new java.util.HashSet<>();
        
        for (ProductRequest.VariantRequest req : variantRequests) {
            ProductVariant variant = null;
            
            // 1. Tìm theo ID gửi lên
            if (req.getId() != null && !req.getId().isBlank()) {
                variant = existingVariantsMap.get(req.getId());
            }
            
            // 2. Nếu không thấy ID, thử tìm theo SKU
            if (variant == null && req.getSku() != null && !req.getSku().isBlank()) {
                variant = product.getVariants().stream()
                        .filter(v -> req.getSku().equals(v.getSku()))
                        .findFirst().orElse(null);
            }

            if (variant == null) {
                // Tạo mới nếu thực sự là mới
                variant = ProductVariant.builder()
                        .product(product)
                        .sku(req.getSku())
                        .build();
                product.getVariants().add(variant);
            }

            // Cập nhật thông tin
            variant.setSku(req.getSku()); // Cho phép đổi SKU trên chính bản ghi cũ
            variant.setName(req.getName());
            variant.setPrice(req.getPrice());
            variant.setOriginalPrice(req.getOriginalPrice());
            variant.setStockQuantity(req.getStockQuantity());
            variant.setColor(req.getColor());
            variant.setSize(req.getSize());
            variant.setSortOrder(req.getSortOrder());
            variant.setActive(true);
            
            if (variant.getId() != null) {
                processedIds.add(variant.getId());
            }
        }

        // Chỉ xóa những Variant không nằm trong danh sách xử lý (processedIds)
        // product.getVariants().removeIf(v -> v.getId() != null && !processedIds.contains(v.getId()));
    }

    private void syncAttributes(Product product, List<ProductRequest.AttributeRequest> attributeRequests) {
        product.getAttributes().clear();

        if (attributeRequests == null) {
            return;
        }

        for (ProductRequest.AttributeRequest requestAttribute : attributeRequests) {
            if (requestAttribute.getName() == null || requestAttribute.getName().isBlank()
                    || requestAttribute.getValue() == null || requestAttribute.getValue().isBlank()) {
                continue;
            }

            ProductAttribute attribute = ProductAttribute.builder()
                    .product(product)
                    .attributeName(requestAttribute.getName().trim())
                    .attributeValue(requestAttribute.getValue().trim())
                    .build();
            product.getAttributes().add(attribute);
        }
    }

    private void syncImages(Product product, List<String> imageUrls) {
        product.getImages().clear();

        if (imageUrls == null) {
            return;
        }

        List<String> sanitizedImageUrls = imageUrls.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(url -> !url.isBlank())
                .collect(Collectors.toList());

        for (int i = 0; i < sanitizedImageUrls.size(); i++) {
            ProductImage image = ProductImage.builder()
                    .product(product)
                    .imageUrl(sanitizedImageUrls.get(i))
                    .isThumbnail(i == 0)
                    .build();
            product.getImages().add(image);
        }
    }
}
