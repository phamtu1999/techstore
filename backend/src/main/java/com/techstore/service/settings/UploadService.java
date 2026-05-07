package com.techstore.service.settings;

import com.techstore.entity.user.User;
import com.techstore.exception.AppException;
import com.techstore.exception.ErrorCode;
import com.techstore.service.storage.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Paths;
import java.time.Duration;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class UploadService {

    private static final Pattern FOLDER_PATTERN = Pattern.compile("^[a-zA-Z0-9/_-]{1,80}$");
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp", "gif");

    private final StorageService storageService;
    private final StringRedisTemplate stringRedisTemplate;

    @Value("${app.upload.max-file-size-bytes:5242880}")
    private long maxFileSizeBytes;

    @Value("${app.upload.max-files-per-day:50}")
    private long maxFilesPerDay;

    @Value("#{'${app.upload.allowed-content-types:image/jpeg,image/png,image/webp,image/gif}'.split(',')}")
    private List<String> configuredAllowedContentTypes;

    public String uploadFile(MultipartFile file, String folder, User user) {
        if (user == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        validateFile(file);
        enforceDailyQuota(user.getId());
        String sanitizedFolder = sanitizeFolder(folder);

        try {
            return storageService.uploadFile(
                    file.getBytes(),
                    file.getOriginalFilename(),
                    sanitizedFolder,
                    file.getContentType()
            );
        } catch (IOException e) {
            throw new RuntimeException("Tải tệp lên hệ thống lưu trữ thất bại: " + e.getMessage());
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File upload khong duoc de trong");
        }

        if (file.getSize() > maxFileSizeBytes) {
            throw new IllegalArgumentException(
                    "File vuot qua gioi han " + Math.max(1, maxFileSizeBytes / (1024 * 1024)) + "MB"
            );
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new IllegalArgumentException("Ten file khong hop le");
        }

        String extension = extractExtension(originalFilename);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("Chi ho tro cac dinh dang anh: jpg, jpeg, png, webp, gif");
        }

        Set<String> allowedContentTypes = new HashSet<>();
        for (String value : configuredAllowedContentTypes) {
            if (value != null && !value.isBlank()) {
                allowedContentTypes.add(value.trim().toLowerCase());
            }
        }

        String contentType = file.getContentType();
        if (contentType == null || !allowedContentTypes.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Loai file khong duoc phep");
        }
    }

    private void enforceDailyQuota(String userId) {
        String redisKey = "upload_quota:" + userId + ":" + LocalDate.now();
        Long currentCount = stringRedisTemplate.opsForValue().increment(redisKey);
        if (currentCount == null) {
            throw new IllegalStateException("Khong the kiem tra upload quota");
        }

        if (currentCount == 1L) {
            ZoneId zoneId = ZoneId.of("Asia/Ho_Chi_Minh");
            ZonedDateTime now = ZonedDateTime.now(zoneId);
            ZonedDateTime nextDay = now.toLocalDate().plusDays(1).atStartOfDay(zoneId);
            Duration ttl = Duration.between(now, nextDay);
            stringRedisTemplate.expire(redisKey, ttl.isNegative() || ttl.isZero() ? Duration.ofDays(1) : ttl);
        }

        if (currentCount > maxFilesPerDay) {
            throw new IllegalArgumentException("Da vuot qua gioi han " + maxFilesPerDay + " file moi ngay");
        }
    }

    private String sanitizeFolder(String folder) {
        String normalizedFolder = folder == null ? "general" : folder.trim().replace('\\', '/');
        normalizedFolder = normalizedFolder.replaceAll("/{2,}", "/");
        normalizedFolder = normalizedFolder.replaceAll("^/+|/+$", "");

        if (normalizedFolder.isBlank()) {
            normalizedFolder = "general";
        }

        if (normalizedFolder.contains("..") || !FOLDER_PATTERN.matcher(normalizedFolder).matches()) {
            throw new IllegalArgumentException("Folder upload khong hop le");
        }

        return normalizedFolder;
    }

    private String extractExtension(String originalFilename) {
        String normalizedFileName = Paths.get(originalFilename).getFileName().toString();
        int lastDotIndex = normalizedFileName.lastIndexOf('.');
        if (lastDotIndex < 0 || lastDotIndex == normalizedFileName.length() - 1) {
            throw new IllegalArgumentException("Ten file khong hop le");
        }
        return normalizedFileName.substring(lastDotIndex + 1).toLowerCase();
    }
}
