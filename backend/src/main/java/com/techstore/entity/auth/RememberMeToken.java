package com.techstore.entity.auth;

import com.techstore.entity.user.User;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * RememberMeToken entity for persistent "Remember Me" authentication.
 * Stores hashed tokens that allow users to maintain authentication across browser sessions.
 * 
 * Security Notes:
 * - token_value should be hashed before storage (BCrypt)
 * - device_fingerprint stores browser/device identification for security tracking
 * - Expired tokens should be cleaned up periodically (scheduled job)
 */
@Entity
@Table(name = "remember_me_tokens", indexes = {
    @Index(name = "idx_token_value", columnList = "token_value", unique = true),
    @Index(name = "idx_user_id", columnList = "user_id"),
    @Index(name = "idx_expiration_timestamp", columnList = "expiration_timestamp")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RememberMeToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "token_value", nullable = false, unique = true, length = 255)
    private String tokenValue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "expiration_timestamp", nullable = false)
    private Instant expirationTimestamp;

    @Column(name = "created_timestamp", nullable = false)
    private Instant createdTimestamp;

    @Column(name = "device_fingerprint", length = 500)
    private String deviceFingerprint;

    /**
     * Checks if the token has expired
     * @return true if token has expired, false if still valid
     */
    public boolean isExpired() {
        return Instant.now().isAfter(expirationTimestamp);
    }

    /**
     * Checks if the token is still valid
     * @return true if token is still valid, false if expired
     */
    public boolean isValid() {
        return !isExpired();
    }
}
