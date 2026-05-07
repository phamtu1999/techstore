package com.techstore.entity.auth;

import com.techstore.entity.user.User;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "login_history", indexes = {
    @Index(name = "idx_username", columnList = "username"),
    @Index(name = "idx_timestamp", columnList = "timestamp"),
    @Index(name = "idx_username_timestamp", columnList = "username, timestamp"),
    @Index(name = "idx_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String username;

    @Column(name = "ip_address", nullable = false, length = 45)
    private String ipAddress;

    @Column(length = 255)
    private String location;

    @Column(name = "device_info", length = 500)
    private String deviceInfo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LoginStatus status;

    @Column(name = "failure_reason", length = 255)
    private String failureReason;

    @Column(nullable = false)
    private Instant timestamp;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    public enum LoginStatus {
        SUCCESS,
        FAILURE
    }
}
