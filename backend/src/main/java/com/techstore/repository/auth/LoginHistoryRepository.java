package com.techstore.repository.auth;

import com.techstore.entity.auth.LoginHistory;


import com.techstore.entity.auth.LoginHistory.LoginStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;

@Repository
public interface LoginHistoryRepository extends JpaRepository<LoginHistory, String> {
    
    /**
     * Find login history by username with pagination
     */
    Page<LoginHistory> findByUsername(String username, Pageable pageable);
    
    /**
     * Find login history by status with pagination
     */
    Page<LoginHistory> findByStatus(LoginStatus status, Pageable pageable);
    
    /**
     * Find login history by username and status with pagination
     */
    Page<LoginHistory> findByUsernameAndStatus(String username, LoginStatus status, Pageable pageable);
    
    /**
     * Find login history by username within a date range with pagination
     */
    Page<LoginHistory> findByUsernameAndTimestampBetween(
        String username, 
        Instant startDate, 
        Instant endDate, 
        Pageable pageable
    );
    
    /**
     * Find login history by status within a date range with pagination
     */
    Page<LoginHistory> findByStatusAndTimestampBetween(
        LoginStatus status, 
        Instant startDate, 
        Instant endDate, 
        Pageable pageable
    );
    
    /**
     * Find login history by username, status, and date range with pagination
     */
    Page<LoginHistory> findByUsernameAndStatusAndTimestampBetween(
        String username, 
        LoginStatus status, 
        Instant startDate, 
        Instant endDate, 
        Pageable pageable
    );
}
