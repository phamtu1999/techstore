package com.techstore.controller.user;

import com.techstore.dto.ApiResponse;
import com.techstore.dto.user.UserCreationRequest;
import com.techstore.dto.user.UserFilterRequest;
import com.techstore.dto.user.UserResponse;
import com.techstore.service.user.AdminUserService;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ApiResponse<Void> createUser(@RequestBody UserCreationRequest request) {
        adminUserService.createUser(request);
        return ApiResponse.<Void>builder()
                .message("Đã tạo người dùng thành công")
                .build();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ApiResponse<Page<UserResponse>> getAllUsers(@ModelAttribute UserFilterRequest filter) {
        return ApiResponse.<Page<UserResponse>>builder()
                .result(adminUserService.getAllUsers(filter))
                .build();
    }

    @PostMapping("/filter")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ApiResponse<Page<UserResponse>> filterUsers(@RequestBody UserFilterRequest filter) {
        return ApiResponse.<Page<UserResponse>>builder()
                .result(adminUserService.getAllUsers(filter))
                .build();
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ApiResponse<Void> toggleStatus(@PathVariable String id) {
        adminUserService.toggleStatus(id);
        return ApiResponse.<Void>builder()
                .message("Đã cập nhật trạng thái người dùng")
                .build();
    }

    @PutMapping("/{id}/lock")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ApiResponse<Void> lockUser(@PathVariable String id) {
        adminUserService.lockUser(id);
        return ApiResponse.<Void>builder()
                .message("Đã khóa người dùng")
                .build();
    }

    @PutMapping("/{id}/unlock")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ApiResponse<Void> unlockUser(@PathVariable String id) {
        adminUserService.unlockUser(id);
        return ApiResponse.<Void>builder()
                .message("Đã mở khóa người dùng")
                .build();
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ApiResponse<Void> updateRole(@PathVariable String id, @RequestParam String role) {
        adminUserService.updateRole(id, role);
        return ApiResponse.<Void>builder()
                .message("Đã cập nhật vai trò người dùng")
                .build();
    }

    @PutMapping("/{id}/password")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ApiResponse<Void> resetPassword(@PathVariable String id, @RequestParam String newPassword) {
        adminUserService.resetPassword(id, newPassword);
        return ApiResponse.<Void>builder()
                .message("Đã đặt lại mật khẩu người dùng")
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ApiResponse<Void> deleteUser(@PathVariable String id) {
        adminUserService.deleteUser(id);
        return ApiResponse.<Void>builder()
                .message("Đã xóa người dùng")
                .build();
    }
}

