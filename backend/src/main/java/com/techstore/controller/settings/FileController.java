package com.techstore.controller.settings;

import com.techstore.dto.ApiResponse;
import com.techstore.entity.user.User;
import com.techstore.service.settings.UploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
public class FileController {

    private final UploadService uploadService;

    @PostMapping("/upload")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<String> uploadFile(
            @AuthenticationPrincipal User user,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "general") String folder
    ) {
        String url = uploadService.uploadFile(file, folder, user);
        return ApiResponse.<String>builder()
                .result(url)
                .build();
    }
}
