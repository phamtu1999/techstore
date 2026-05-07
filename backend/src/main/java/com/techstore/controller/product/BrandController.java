package com.techstore.controller.product;

import com.techstore.dto.ApiResponse;
import com.techstore.dto.PageResponse;
import com.techstore.dto.brand.BrandRequest;
import com.techstore.dto.brand.BrandResponse;
import com.techstore.service.brand.BrandService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin
public class BrandController {
    private final BrandService brandService;

    // Public API
    @GetMapping("/api/v1/brands")
    public ApiResponse<List<BrandResponse>> getAllBrands() {
        return ApiResponse.<List<BrandResponse>>builder()
                .result(brandService.getAllBrands())
                .build();
    }

    @GetMapping("/api/v1/brands/{id}")
    public ApiResponse<BrandResponse> getBrandById(@PathVariable String id) {
        return ApiResponse.<BrandResponse>builder()
                .result(brandService.getBrandById(id))
                .build();
    }

    // Admin API
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'SUPER_ADMIN')")
    @GetMapping("/api/v1/admin/brands")
    public ApiResponse<PageResponse<BrandResponse>> adminGetAllBrands(Pageable pageable) {
        List<BrandResponse> allBrands = brandService.getAllBrands();
        int page = Math.max(pageable.getPageNumber(), 0);
        int size = pageable.getPageSize() > 0 ? pageable.getPageSize() : allBrands.size();
        int fromIndex = Math.min(page * size, allBrands.size());
        int toIndex = Math.min(fromIndex + size, allBrands.size());
        List<BrandResponse> content = allBrands.subList(fromIndex, toIndex);
        return ApiResponse.<PageResponse<BrandResponse>>builder()
                .result(PageResponse.<BrandResponse>builder()
                        .content(content)
                        .pageNumber(page)
                        .pageSize(size)
                        .totalElements(allBrands.size())
                        .totalPages(size == 0 ? 1 : (int) Math.ceil((double) allBrands.size() / size))
                        .first(page == 0)
                        .last(toIndex >= allBrands.size())
                        .hasNext(toIndex < allBrands.size())
                        .hasPrevious(page > 0)
                        .build())
                .build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/api/v1/admin/brands")
    public ApiResponse<BrandResponse> createBrand(@RequestBody @Valid BrandRequest request) {
        return ApiResponse.<BrandResponse>builder()
                .message("Tạo thương hiệu thành công")
                .result(brandService.createBrand(request))
                .build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/api/v1/admin/brands/{id}")
    public ApiResponse<BrandResponse> updateBrand(@PathVariable String id, @RequestBody @Valid BrandRequest request) {
        return ApiResponse.<BrandResponse>builder()
                .message("Cập nhật thương hiệu thành công")
                .result(brandService.updateBrand(id, request))
                .build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'SUPER_ADMIN')")
    @DeleteMapping("/api/v1/admin/brands/{id}")
    public ApiResponse<Void> deleteBrand(@PathVariable String id) {
        brandService.deleteBrand(id);
        return ApiResponse.<Void>builder()
                .message("Xóa thương hiệu thành công")
                .build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'SUPER_ADMIN')")
    @PutMapping("/api/v1/admin/brands/{id}/status")
    public ApiResponse<BrandResponse> toggleBrandStatus(@PathVariable String id) {
        return ApiResponse.<BrandResponse>builder()
                .message("Cập nhật trạng thái thành công")
                .result(brandService.toggleStatus(id))
                .build();
    }
}
