package com.techstore.service.auth;

import com.techstore.entity.auth.LoginHistory;
import com.techstore.entity.auth.LoginHistory.LoginStatus;
import com.techstore.repository.auth.LoginHistoryRepository;
import com.techstore.service.settings.GeolocationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class LoginHistoryWriter {

    private final LoginHistoryRepository loginHistoryRepository;
    private final GeolocationService geolocationService;

    @Transactional
    public LoginHistory recordLoginAttempt(
            String username,
            String ipAddress,
            String deviceInfo,
            LoginStatus status,
            String failureReason
    ) {
        String location = geolocationService.resolveLocation(ipAddress);

        // Truncate fields to 255 characters
        String safeDeviceInfo = deviceInfo != null && deviceInfo.length() > 255 ? deviceInfo.substring(0, 255) : deviceInfo;
        String safeFailureReason = failureReason != null && failureReason.length() > 255 ? failureReason.substring(0, 255) : failureReason;
        String safeLocation = location != null && location.length() > 255 ? location.substring(0, 255) : location;

        LoginHistory loginHistory = LoginHistory.builder()
                .username(username)
                .ipAddress(ipAddress)
                .location(safeLocation)
                .deviceInfo(safeDeviceInfo)
                .status(status)
                .failureReason(safeFailureReason)
                .timestamp(java.time.Instant.now())
                .build();

        log.info("Recording login attempt: {} for user: {}", status, username);
        return loginHistoryRepository.save(loginHistory);
    }
}
