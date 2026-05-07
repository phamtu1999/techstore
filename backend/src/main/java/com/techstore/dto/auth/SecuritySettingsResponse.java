package com.techstore.dto.auth;

import com.techstore.entity.auth.SecuritySettings;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SecuritySettingsResponse {

    private String id;

    // Two-Factor Authentication Settings
    private Boolean twoFactorEnabled;
    private List<String> allowedTwoFactorMethods;

    // Password Policy Settings
    private Integer passwordMinLength;
    private Boolean requireSpecialChar;
    private Boolean requireUppercase;
    private Boolean requireNumeric;
    private Integer passwordExpirationDays;
    private Integer maxFailedLoginAttempts;
    private Integer accountLockoutMinutes;

    // Token and Session Settings
    private Integer accessTokenLifetimeMinutes;
    private Integer refreshTokenLifetimeDays;
    private Integer sessionTimeoutMinutes;
    private Boolean rememberMeEnabled;
    private Integer rememberMeLifetimeDays;

    // CORS and API Security Settings
    private List<String> corsAllowedDomains;
    private Integer rateLimitPerMinute;
    private Boolean apiKeyAuthEnabled;
    private List<String> ipWhitelist;
    private List<String> ipBlacklist;

    // Audit Fields
    private Instant createdAt;
    private Instant updatedAt;
    private String lastModifiedBy;

    /**
     * Converts SecuritySettings entity to SecuritySettingsResponse DTO
     */
    public static SecuritySettingsResponse fromEntity(SecuritySettings entity) {
        if (entity == null) {
            return null;
        }

        ObjectMapper objectMapper = new ObjectMapper();

        return SecuritySettingsResponse.builder()
                .id(entity.getId())
                .twoFactorEnabled(entity.getTwoFactorEnabled())
                .allowedTwoFactorMethods(parseJsonList(entity.getAllowedTwoFactorMethods(), objectMapper))
                .passwordMinLength(entity.getPasswordMinLength())
                .requireSpecialChar(entity.getRequireSpecialChar())
                .requireUppercase(entity.getRequireUppercase())
                .requireNumeric(entity.getRequireNumeric())
                .passwordExpirationDays(entity.getPasswordExpirationDays())
                .maxFailedLoginAttempts(entity.getMaxFailedLoginAttempts())
                .accountLockoutMinutes(entity.getAccountLockoutMinutes())
                .accessTokenLifetimeMinutes(entity.getAccessTokenLifetimeMinutes())
                .refreshTokenLifetimeDays(entity.getRefreshTokenLifetimeDays())
                .sessionTimeoutMinutes(entity.getSessionTimeoutMinutes())
                .rememberMeEnabled(entity.getRememberMeEnabled())
                .rememberMeLifetimeDays(entity.getRememberMeLifetimeDays())
                .corsAllowedDomains(parseJsonList(entity.getCorsAllowedDomains(), objectMapper))
                .rateLimitPerMinute(entity.getRateLimitPerMinute())
                .apiKeyAuthEnabled(entity.getApiKeyAuthEnabled())
                .ipWhitelist(parseJsonList(entity.getIpWhitelist(), objectMapper))
                .ipBlacklist(parseJsonList(entity.getIpBlacklist(), objectMapper))
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .lastModifiedBy(entity.getLastModifiedBy() != null ? entity.getLastModifiedBy().getEmail() : null)
                .build();
    }

    /**
     * Helper method to parse JSON string to List<String>
     */
    private static List<String> parseJsonList(String json, ObjectMapper objectMapper) {
        if (json == null || json.trim().isEmpty()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }
}
