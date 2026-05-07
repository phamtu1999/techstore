package com.techstore.controller.category;

import com.techstore.dto.ApiResponse;
import com.techstore.dto.PageResponse;
import com.techstore.dto.category.CategoryRequest;
import com.techstore.dto.category.CategoryResponse;
import com.techstore.service.category.CategoryService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("/api/v1/categories")
    public ApiResponse<List<CategoryResponse>> getAllCategories() {
        return ApiResponse.<List<CategoryResponse>>builder()
                .result(categoryService.getAllCategories())
                .build();
    }

    @GetMapping("/api/v1/admin/categories")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'SUPER_ADMIN')")
    public ApiResponse<PageResponse<CategoryResponse>> adminGetAllCategories(Pageable pageable) {
        List<CategoryResponse> allCategories = categoryService.getAllCategories();
        int page = Math.max(pageable.getPageNumber(), 0);
        int size = pageable.getPageSize() > 0 ? pageable.getPageSize() : allCategories.size();
        int fromIndex = Math.min(page * size, allCategories.size());
        int toIndex = Math.min(fromIndex + size, allCategories.size());
        List<CategoryResponse> content = allCategories.subList(fromIndex, toIndex);
        return ApiResponse.<PageResponse<CategoryResponse>>builder()
                .result(PageResponse.<CategoryResponse>builder()
                        .content(content)
                        .pageNumber(page)
                        .pageSize(size)
                        .totalElements(allCategories.size())
                        .totalPages(size == 0 ? 1 : (int) Math.ceil((double) allCategories.size() / size))
                        .first(page == 0)
                        .last(toIndex >= allCategories.size())
                        .hasNext(toIndex < allCategories.size())
                        .hasPrevious(page > 0)
                        .build())
                .build();
    }

    @GetMapping("/api/v1/categories/{id}")
    public ApiResponse<CategoryResponse> getCategoryById(@PathVariable String id) {
        return ApiResponse.<CategoryResponse>builder()
                .result(categoryService.getCategoryById(id))
                .build();
    }

    @PostMapping("/api/v1/admin/categories")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'SUPER_ADMIN')")
    public ApiResponse<CategoryResponse> createCategory(@RequestBody @Valid CategoryRequest request) {
        return ApiResponse.<CategoryResponse>builder()
                .message("Tạo danh mục thành công")
                .result(categoryService.createCategory(request))
                .build();
    }

    @PutMapping("/api/v1/admin/categories/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'SUPER_ADMIN')")
    public ApiResponse<CategoryResponse> updateCategory(
            @PathVariable String id,
            @RequestBody @Valid CategoryRequest request
    ) {
        return ApiResponse.<CategoryResponse>builder()
                .message("Cập nhật danh mục thành công")
                .result(categoryService.updateCategory(id, request))
                .build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'SUPER_ADMIN')")
    @DeleteMapping("/api/v1/admin/categories/{id}")
    public ApiResponse<Void> deleteCategory(@PathVariable String id) {
        categoryService.deleteCategory(id);
        return ApiResponse.<Void>builder()
                .message("Xóa danh mục thành công")
                .build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'SUPER_ADMIN')")
    @PutMapping("/api/v1/admin/categories/{id}/status")
    public ApiResponse<CategoryResponse> toggleCategoryStatus(@PathVariable String id) {
        return ApiResponse.<CategoryResponse>builder()
                .message("Cập nhật trạng thái thành công")
                .result(categoryService.toggleStatus(id))
                .build();
    }
}
