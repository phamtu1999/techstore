package com.techstore.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private String id;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private String avatar;
    private boolean enabled;
    private Set<String> roles;
    private Instant createdAt;
    private String status; // ACTIVE, LOCKED, UNVERIFIED
    private Boolean emailVerified;
    private Long totalOrders;
    private Double totalSpent;
    private Instant lastLogin;
    private Boolean twoFactorEnabled;
}
