package com.techstore.dto.auth;

import com.techstore.entity.user.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TwoFactorUserResponse {

    private String userId;
    private String username;
    private String email;
    private String twoFactorMethod;
    private Instant enrolledAt;

    /**
     * Converts User entity to TwoFactorUserResponse DTO
     */
    public static TwoFactorUserResponse fromEntity(User entity) {
        if (entity == null) {
            return null;
        }

        return TwoFactorUserResponse.builder()
                .userId(entity.getId())
                .username(entity.getEmail())
                .email(entity.getEmail())
                .twoFactorMethod(entity.getTwoFactorMethod())
                .enrolledAt(entity.getTwoFactorEnrolledAt())
                .build();
    }
}
