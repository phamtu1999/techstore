package com.techstore.service.auth;

import com.techstore.entity.auth.LoginHistory;
import com.techstore.entity.auth.LoginHistory.LoginStatus;
import com.techstore.repository.auth.LoginHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
public class LoginHistoryQueryService {

    private final LoginHistoryRepository loginHistoryRepository;

    @Transactional(readOnly = true)
    public Page<LoginHistory> getLoginHistory(
            String username,
            Instant startDate,
            Instant endDate,
            String status,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));

        LoginStatus loginStatus = null;
        if (status != null && !status.equalsIgnoreCase("ALL")) {
            try {
                loginStatus = LoginStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid status filter: {}", status);
            }
        }

        boolean hasUsername = username != null && !username.trim().isEmpty();
        boolean hasDateRange = startDate != null && endDate != null;

        if (hasUsername && hasDateRange && loginStatus != null) {
            return loginHistoryRepository.findByUsernameAndStatusAndTimestampBetween(
                    username, loginStatus, startDate, endDate, pageable
            );
        }
        if (hasUsername && hasDateRange) {
            return loginHistoryRepository.findByUsernameAndTimestampBetween(
                    username, startDate, endDate, pageable
            );
        }
        if (hasUsername && loginStatus != null) {
            return loginHistoryRepository.findByUsernameAndStatus(username, loginStatus, pageable);
        }
        if (hasUsername) {
            return loginHistoryRepository.findByUsername(username, pageable);
        }
        if (hasDateRange && loginStatus != null) {
            return loginHistoryRepository.findByStatusAndTimestampBetween(
                    loginStatus, startDate, endDate, pageable
            );
        }
        if (loginStatus != null) {
            return loginHistoryRepository.findByStatus(loginStatus, pageable);
        }
        return loginHistoryRepository.findAll(pageable);
    }
}
