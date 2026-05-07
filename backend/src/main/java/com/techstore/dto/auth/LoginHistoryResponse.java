package com.techstore.dto.auth;

import com.techstore.entity.auth.LoginHistory;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginHistoryResponse {

    private String id;
    private String username;
    private String ipAddress;
    private String location;
    private String deviceInfo;
    private String status;
    private Instant timestamp;
    private String failureReason;

    /**
     * Converts LoginHistory entity to LoginHistoryResponse DTO
     */
    public static LoginHistoryResponse fromEntity(LoginHistory entity) {
        if (entity == null) {
            return null;
        }

        return LoginHistoryResponse.builder()
                .id(entity.getId())
                .username(entity.getUsername())
                .ipAddress(entity.getIpAddress())
                .location(entity.getLocation())
                .deviceInfo(entity.getDeviceInfo())
                .status(entity.getStatus() != null ? entity.getStatus().name() : null)
                .timestamp(entity.getTimestamp())
                .failureReason(entity.getFailureReason())
                .build();
    }
}
