package com.techstore.dto.auth;

import com.techstore.entity.auth.ActiveSession;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActiveSessionResponse {

    private String sessionId;
    private String username;
    private String ipAddress;
    private String deviceInfo;
    private Instant loginTimestamp;
    private Instant lastActivityTimestamp;
    private String status;

    /**
     * Converts ActiveSession entity to ActiveSessionResponse DTO
     */
    public static ActiveSessionResponse fromEntity(ActiveSession entity) {
        if (entity == null) {
            return null;
        }

        return ActiveSessionResponse.builder()
                .sessionId(entity.getSessionId())
                .username(entity.getUsername())
                .ipAddress(entity.getIpAddress())
                .deviceInfo(entity.getDeviceInfo())
                .loginTimestamp(entity.getLoginTimestamp())
                .lastActivityTimestamp(entity.getLastActivityTimestamp())
                .status("ACTIVE")
                .build();
    }
}
