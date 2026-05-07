package com.techstore.controller.product;

import com.techstore.dto.ApiResponse;
import com.techstore.dto.product.ProductRequest;
import com.techstore.service.product.ProductAdminService;
import com.techstore.service.settings.ExcelService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import com.techstore.security.LogAction;

@RestController
@RequestMapping("/api/v1/admin/products")
@RequiredArgsConstructor
@Validated
public class ProductAdminController {

    private final ProductAdminService productAdminService;
    private final com.techstore.service.product.ProductQueryService productService;
    private final ExcelService excelService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'SUPER_ADMIN')")
    public ApiResponse<com.techstore.dto.PageResponse<com.techstore.dto.product.ProductResponse>> getAdminProducts(
            @RequestParam(required = false) 
            @Size(max = 100) 
            @Pattern(regexp = "^[^'\";<>]*$", message = "Query contains invalid characters")
            String q,
            @RequestParam(required = false) 
            @Size(max = 100) 
            @Pattern(regexp = "^[^'\";<>]*$", message = "Query contains invalid characters")
            String query,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String brandId,
            @RequestParam(required = false) java.math.BigDecimal minPrice,
            @RequestParam(required = false) java.math.BigDecimal maxPrice,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) Boolean lowStock,
            org.springframework.data.domain.Pageable pageable
    ) {
        String searchTerm = StringUtils.hasText(query) ? query : q;
        String resolvedCategory = StringUtils.hasText(category) ? category : categoryId;
        String resolvedBrand = StringUtils.hasText(brand) ? brand : brandId;
        return ApiResponse.<com.techstore.dto.PageResponse<com.techstore.dto.product.ProductResponse>>builder()
                .result(productService.getAdminProducts(searchTerm, resolvedCategory, resolvedBrand, minPrice, maxPrice, active, lowStock, pageable))
                .build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'SUPER_ADMIN')")
    public ApiResponse<com.techstore.dto.product.ProductResponse> getAdminProduct(@PathVariable String id) {
        return ApiResponse.<com.techstore.dto.product.ProductResponse>builder()
                .result(productService.getProductById(id))
                .build();
    }

    @LogAction("EXPORT_PRODUCTS_EXCEL")
    @GetMapping("/export")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'SUPER_ADMIN')")
    public ResponseEntity<byte[]> exportProducts() {
        byte[] excelData = excelService.exportProducts();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=products.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelData);
    }

    @LogAction("CREATE_PRODUCT")
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'SUPER_ADMIN')")
    public ApiResponse<String> createProduct(@RequestBody ProductRequest request) {
        productAdminService.createProduct(request);
        return ApiResponse.<String>builder()
                .message("Đã tạo sản phẩm thành công")
                .result("OK")
                .build();
    }

    @LogAction("IMPORT_PRODUCTS_EXCEL")
    @PostMapping("/import")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'SUPER_ADMIN')")
    public ApiResponse<String> importProducts(@RequestParam("file") MultipartFile file) {
        excelService.importProducts(file);
        return ApiResponse.<String>builder()
                .message("Đã nhập sản phẩm thành công")
                .result("OK")
                .build();
    }

    @LogAction("UPDATE_PRODUCT")
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'SUPER_ADMIN')")
    public ApiResponse<String> updateProduct(@PathVariable String id, @RequestBody ProductRequest request) {
        productAdminService.updateProduct(id, request);
        return ApiResponse.<String>builder()
                .message("Đã cập nhật sản phẩm thành công")
                .result("OK")
                .build();
    }

    @LogAction("DELETE_PRODUCT")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'SUPER_ADMIN')")
    public ApiResponse<String> deleteProduct(@PathVariable String id) {
        productAdminService.deleteProduct(id);
        return ApiResponse.<String>builder()
                .message("Đã xóa sản phẩm thành công")
                .result("OK")
                .build();
    }

    @LogAction("TOGGLE_PRODUCT_STATUS")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'SUPER_ADMIN')")
    @PutMapping("/{id}/status")
    public ApiResponse<String> toggleProductStatus(@PathVariable String id) {
        productAdminService.toggleStatus(id);
        return ApiResponse.<String>builder()
                .message("Cập nhật trạng thái thành công")
                .result("OK")
                .build();
    }
}
