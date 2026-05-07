package com.techstore.repository.settings;

import com.techstore.entity.settings.SystemLog;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;

@Repository
public interface SystemLogRepository extends JpaRepository<SystemLog, String> {
    Page<SystemLog> findAll(Pageable pageable);
    
    Page<SystemLog> findByTimestampBetween(Instant start, Instant end, Pageable pageable);
    
    Page<SystemLog> findByActionAndStatusAndTimestampBetween(
            String action, String status, Instant start, Instant end, Pageable pageable);
            
    Page<SystemLog> findByActionAndTimestampBetween(
            String action, Instant start, Instant end, Pageable pageable);
            
    Page<SystemLog> findByStatusAndTimestampBetween(
            String status, Instant start, Instant end, Pageable pageable);
}
