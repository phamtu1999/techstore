package com.techstore.dto.settings;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SystemLogResponse {
    String id;
    String action;
    String message;
    String username; // Will be masked
    String status;
    String ipAddress;
    String details;
    Instant timestamp;

    public static SystemLogResponse fromEntity(com.techstore.entity.settings.SystemLog entity) {
        return SystemLogResponse.builder()
                .id(entity.getId())
                .action(entity.getAction())
                .message(entity.getMessage())
                .status(entity.getStatus())
                .ipAddress(entity.getIpAddress())
                .details(entity.getDetails())
                .timestamp(entity.getTimestamp())
                .username(maskEmail(entity.getUsername()))
                .build();
    }

    private static String maskEmail(String email) {
        if (email == null || !email.contains("@")) return "anonymous";
        int atIndex = email.indexOf("@");
        if (atIndex <= 3) return "***" + email.substring(atIndex);
        return email.substring(0, 3) + "***" + email.substring(atIndex);
    }
}
