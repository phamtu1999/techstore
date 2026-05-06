package com.techstore.controller.category;

import com.techstore.dto.ApiResponse;
import com.techstore.dto.category.CategoryRequest;
import com.techstore.dto.category.CategoryResponse;
import com.techstore.service.category.CategoryService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
    public ApiResponse<List<CategoryResponse>> adminGetAllCategories() {
        return ApiResponse.<List<CategoryResponse>>builder()
                .result(categoryService.getAllCategories())
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

    @DeleteMapping("/api/v1/admin/categories/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'SUPER_ADMIN')")
    public ApiResponse<Void> deleteCategory(@PathVariable String id) {
        categoryService.deleteCategory(id);
        return ApiResponse.<Void>builder()
                .message("Xóa danh mục thành công")
                .build();
    }
}
