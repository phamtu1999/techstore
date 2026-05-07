package com.techstore.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponse {
    private String fullName;
    private String email;
    private String phone;
    private String avatarUrl;
    private String gender;
    private LocalDate dateOfBirth;
    private Instant createdAt;
}
