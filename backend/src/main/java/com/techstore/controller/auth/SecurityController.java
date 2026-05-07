package com.techstore.controller.auth;

import com.techstore.dto.ApiResponse;
import com.techstore.dto.auth.ActiveSessionResponse;
import com.techstore.dto.auth.LoginHistoryResponse;
import com.techstore.dto.auth.SecuritySettingsRequest;
import com.techstore.dto.auth.SecuritySettingsResponse;
import com.techstore.dto.auth.TwoFactorUserResponse;
import com.techstore.entity.auth.SecuritySettings;
import com.techstore.entity.user.User;
import com.techstore.exception.AppException;
import com.techstore.exception.ErrorCode;
import com.techstore.security.JwtService;
import com.techstore.service.auth.LoginHistoryExportService;
import com.techstore.service.auth.LoginHistoryQueryService;
import com.techstore.service.auth.SecuritySettingsService;
import com.techstore.service.auth.SessionCommandService;
import com.techstore.service.auth.SessionQueryService;
import com.techstore.service.auth.TwoFactorAuthenticationService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

/**
 * REST Controller for Admin Security Settings management.
 * Provides endpoints for security configuration, session management, login history, and 2FA management.
 * All endpoints require ADMIN role.
 */
@RestController
@RequestMapping("/api/v1/admin/security")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class SecurityController {

    private final SecuritySettingsService securitySettingsService;
    private final SessionQueryService sessionQueryService;
    private final SessionCommandService sessionCommandService;
    private final LoginHistoryQueryService loginHistoryQueryService;
    private final LoginHistoryExportService loginHistoryExportService;
    private final TwoFactorAuthenticationService twoFactorAuthenticationService;
    private final JwtService jwtService;

    /**
     * GET /api/v1/admin/security/settings
     * Retrieves current security settings configuration.
     *
     * @return ResponseEntity with SecuritySettingsResponse
     */
    @GetMapping("/settings")
    public ResponseEntity<ApiResponse<SecuritySettingsResponse>> getSecuritySettings() {
        SecuritySettings settings = securitySettingsService.getSecuritySettings();
        SecuritySettingsResponse response = SecuritySettingsResponse.fromEntity(settings);
        return ResponseEntity.ok(ApiResponse.<SecuritySettingsResponse>builder()
                .result(response)
                .build());
    }

    /**
     * PUT /api/v1/admin/security/settings
     * Updates security settings configuration.
     *
     * @param request SecuritySettingsRequest with updated values
     * @param authentication Current authenticated user
     * @return ResponseEntity with updated SecuritySettingsResponse
     */
    @PutMapping("/settings")
    public ResponseEntity<ApiResponse<SecuritySettingsResponse>> updateSecuritySettings(
            @Valid @RequestBody SecuritySettingsRequest request,
            Authentication authentication
    ) {
        // Get current user from authentication
        User currentUser = (User) authentication.getPrincipal();

        // Convert request DTO to entity
        SecuritySettings settings = convertRequestToEntity(request);

        // Update settings
        SecuritySettings updatedSettings = securitySettingsService.updateSecuritySettings(settings, currentUser);

        // Convert to response DTO
        SecuritySettingsResponse response = SecuritySettingsResponse.fromEntity(updatedSettings);

        return ResponseEntity.ok(ApiResponse.<SecuritySettingsResponse>builder()
                .result(response)
                .build());
    }

    /**
     * GET /api/v1/admin/security/sessions
     * Retrieves all active sessions.
     *
     * @return ResponseEntity with list of ActiveSessionResponse
     */
    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<List<ActiveSessionResponse>>> getActiveSessions() {
        List<ActiveSessionResponse> sessions = sessionQueryService.getAllActiveSessions()
                .stream()
                .map(ActiveSessionResponse::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.<List<ActiveSessionResponse>>builder()
                .result(sessions)
                .build());
    }

    /**
     * DELETE /api/v1/admin/security/sessions/{sessionId}
     * Terminates a specific session by ID.
     *
     * @param sessionId ID of the session to terminate
     * @return ResponseEntity with 204 No Content on success, 404 Not Found if session doesn't exist
     */
    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<Void> terminateSession(@PathVariable String sessionId) {
        boolean terminated = sessionCommandService.terminateSession(sessionId);

        if (terminated) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * DELETE /api/v1/admin/security/sessions/all
     * Terminates all active sessions except the current admin session.
     *
     * @param authentication Current authenticated user
     * @return ResponseEntity with 204 No Content
     */
    @DeleteMapping("/sessions/all")
    public ResponseEntity<Void> terminateAllSessions(HttpServletRequest request) {
        String currentSessionId = extractCurrentSessionId(request);

        sessionCommandService.terminateAllSessions(true, currentSessionId);

        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/v1/admin/security/login-history
     * Retrieves paginated login history with optional filtering.
     *
     * @param username Optional username filter
     * @param startDate Optional start date filter (ISO 8601 format)
     * @param endDate Optional end date filter (ISO 8601 format)
     * @param status Optional status filter (SUCCESS, FAILURE, or ALL)
     * @param page Page number (default: 0)
     * @param size Page size (default: 50)
     * @return ResponseEntity with Page of LoginHistoryResponse
     */
    @GetMapping("/login-history")
    public ResponseEntity<ApiResponse<Page<LoginHistoryResponse>>> getLoginHistory(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        Page<LoginHistoryResponse> loginHistory = loginHistoryQueryService.getLoginHistory(
                username, startDate, endDate, status, page, size
        ).map(LoginHistoryResponse::fromEntity);

        return ResponseEntity.ok(ApiResponse.<Page<LoginHistoryResponse>>builder()
                .result(loginHistory)
                .build());
    }

    /**
     * GET /api/v1/admin/security/login-history/export
     * Exports login history to CSV format with optional filtering.
     *
     * @param username Optional username filter
     * @param startDate Optional start date filter (ISO 8601 format)
     * @param endDate Optional end date filter (ISO 8601 format)
     * @param status Optional status filter (SUCCESS, FAILURE, or ALL)
     * @return ResponseEntity with CSV file as downloadable attachment
     */
    @GetMapping("/login-history/export")
    public ResponseEntity<String> exportLoginHistory(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate,
            @RequestParam(required = false) String status
    ) throws IOException {
        String csvContent = loginHistoryExportService.exportLoginHistoryToCsv(username, startDate, endDate, status);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "login-history.csv");

        return ResponseEntity.ok()
                .headers(headers)
                .body(csvContent);
    }

    /**
     * GET /api/v1/admin/security/2fa/users
     * Retrieves list of users enrolled in 2FA.
     *
     * @return ResponseEntity with list of TwoFactorUserResponse
     */
    @GetMapping("/2fa/users")
    public ResponseEntity<ApiResponse<List<TwoFactorUserResponse>>> get2FAUsers() {
        List<TwoFactorUserResponse> users = twoFactorAuthenticationService.get2FAEnrolledUsers()
                .stream()
                .map(TwoFactorUserResponse::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.<List<TwoFactorUserResponse>>builder()
                .result(users)
                .build());
    }

    /**
     * Helper method to convert SecuritySettingsRequest DTO to SecuritySettings entity.
     *
     * @param request SecuritySettingsRequest DTO
     * @return SecuritySettings entity
     */
    private SecuritySettings convertRequestToEntity(SecuritySettingsRequest request) {
        SecuritySettings settings = new SecuritySettings();

        // Two-Factor Authentication Settings
        settings.setTwoFactorEnabled(request.getTwoFactorEnabled());
        settings.setAllowedTwoFactorMethods(convertListToJson(request.getAllowedTwoFactorMethods()));

        // Password Policy Settings
        settings.setPasswordMinLength(request.getPasswordMinLength());
        settings.setRequireSpecialChar(request.getRequireSpecialChar());
        settings.setRequireUppercase(request.getRequireUppercase());
        settings.setRequireNumeric(request.getRequireNumeric());
        settings.setPasswordExpirationDays(request.getPasswordExpirationDays());
        settings.setMaxFailedLoginAttempts(request.getMaxFailedLoginAttempts());
        settings.setAccountLockoutMinutes(request.getAccountLockoutMinutes());

        // Token and Session Settings
        settings.setAccessTokenLifetimeMinutes(request.getAccessTokenLifetimeMinutes());
        settings.setRefreshTokenLifetimeDays(request.getRefreshTokenLifetimeDays());
        settings.setSessionTimeoutMinutes(request.getSessionTimeoutMinutes());
        settings.setRememberMeEnabled(request.getRememberMeEnabled());
        settings.setRememberMeLifetimeDays(request.getRememberMeLifetimeDays());

        // CORS and API Security Settings
        settings.setCorsAllowedDomains(convertListToJson(request.getCorsAllowedDomains()));
        settings.setRateLimitPerMinute(request.getRateLimitPerMinute());
        settings.setApiKeyAuthEnabled(request.getApiKeyAuthEnabled());
        settings.setIpWhitelist(convertListToJson(request.getIpWhitelist()));
        settings.setIpBlacklist(convertListToJson(request.getIpBlacklist()));

        return settings;
    }

    /**
     * Helper method to convert List<String> to JSON array string.
     *
     * @param list List of strings
     * @return JSON array string (e.g., ["value1","value2"])
     */
    private String convertListToJson(List<String> list) {
        if (list == null || list.isEmpty()) {
            return "[]";
        }
        return "[\"" + String.join("\",\"", list) + "\"]";
    }

    private String extractCurrentSessionId(HttpServletRequest request) {
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        String token = authHeader.substring(7);
        String sessionId = jwtService.extractSessionId(token);
        if (sessionId == null || sessionId.isBlank()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        return sessionId;
    }
}
