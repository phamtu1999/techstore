package com.techstore.service.brand;

import com.techstore.dto.brand.BrandRequest;
import com.techstore.dto.brand.BrandResponse;
import com.techstore.entity.brand.Brand;
import com.techstore.repository.brand.BrandRepository;
import com.techstore.utils.SlugUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BrandService {
    private final BrandRepository brandRepository;

    @Cacheable(value = "brands", key = "'all'")
    public List<BrandResponse> getAllBrands() {
        return brandRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public BrandResponse getBrandById(String id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thương hiệu với ID: " + id));
        return mapToResponse(brand);
    }

    @Transactional
    @CacheEvict(value = "brands", allEntries = true)
    public BrandResponse createBrand(BrandRequest request) {
        String slug = request.getSlug();
        if (slug == null || slug.isBlank()) {
            slug = SlugUtils.makeSlug(request.getName());
        }

        Brand brand = Brand.builder()
                .name(request.getName())
                .slug(slug)
                .logoUrl(request.getLogoUrl())
                .description(request.getDescription())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        return mapToResponse(brandRepository.save(brand));
    }

    @Transactional
    @CacheEvict(value = "brands", allEntries = true)
    public BrandResponse updateBrand(String id, BrandRequest request) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thương hiệu với ID: " + id));

        brand.setName(request.getName());
        
        String slug = request.getSlug();
        if (slug == null || slug.isBlank()) {
            slug = SlugUtils.makeSlug(request.getName());
        }
        brand.setSlug(slug);
        brand.setLogoUrl(request.getLogoUrl());
        brand.setDescription(request.getDescription());
        if (request.getActive() != null) {
            brand.setActive(request.getActive());
        }

        return mapToResponse(brandRepository.save(brand));
    }

    @Transactional
    @CacheEvict(value = "brands", allEntries = true)
    public void deleteBrand(String id) {
        if (!brandRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy thương hiệu với ID: " + id);
        }
        brandRepository.deleteById(id);
    }

    @Transactional
    @CacheEvict(value = "brands", allEntries = true)
    public BrandResponse toggleStatus(String id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thương hiệu với ID: " + id));
        brand.setActive(!brand.isActive());
        return mapToResponse(brandRepository.save(brand));
    }

    private BrandResponse mapToResponse(Brand brand) {
        return BrandResponse.builder()
                .id(brand.getId())
                .name(brand.getName())
                .slug(brand.getSlug())
                .logoUrl(brand.getLogoUrl())
                .description(brand.getDescription())
                .active(brand.isActive())
                .build();
    }
}
