package com.techstore.controller.settings;

import com.techstore.dto.ApiResponse;
import com.techstore.dto.settings.SystemLogResponse;
import com.techstore.repository.settings.SystemLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@RestController
@RequestMapping("/api/v1/admin/system-logs")
@RequiredArgsConstructor
@CrossOrigin
@PreAuthorize("hasRole('ADMIN')")
@lombok.extern.slf4j.Slf4j
public class LogController {

    private final SystemLogRepository logRepository;

    @GetMapping
    @com.techstore.security.LogAction("VIEW_SYSTEM_LOGS")
    public ApiResponse<Page<SystemLogResponse>> getLogs(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) Instant endDate,
            @RequestParam(required = false) String action,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        log.info("Fetching system logs: status={}, start={}, end={}, page={}, size={}", 
            status, startDate, endDate, page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        
        // Default time range if not provided (last 30 days)
        Instant start = startDate != null ? startDate : Instant.now().minus(30, ChronoUnit.DAYS);
        Instant end = endDate != null ? endDate : Instant.now();
        
        Page<SystemLogResponse> logs = Page.empty();
        
        // Status filtering - Case insensitive for "ALL"
        boolean isAllStatus = status == null || status.equalsIgnoreCase("ALL");
        
        if (action != null && !action.isBlank() && !isAllStatus) {
            logs = logRepository.findByActionAndStatusAndTimestampBetween(action, status, start, end, pageable).map(SystemLogResponse::fromEntity);
        } else if (action != null && !action.isBlank()) {
            logs = logRepository.findByActionAndTimestampBetween(action, start, end, pageable).map(SystemLogResponse::fromEntity);
        } else if (!isAllStatus) {
            logs = logRepository.findByStatusAndTimestampBetween(status, start, end, pageable).map(SystemLogResponse::fromEntity);
        } else {
            logs = logRepository.findByTimestampBetween(start, end, pageable).map(SystemLogResponse::fromEntity);
        }

        log.info("Found {} log entries", logs.getTotalElements());
        return ApiResponse.<Page<SystemLogResponse>>builder()
                .result(logs)
                .build();
    }

    @GetMapping("/export")
    @PreAuthorize("hasRole('ADMIN')")
    public org.springframework.http.ResponseEntity<byte[]> exportLogs(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) Instant endDate
    ) {
        Instant start = startDate != null ? startDate : Instant.now().minus(90, ChronoUnit.DAYS);
        Instant end = endDate != null ? endDate : Instant.now();
        
        java.util.List<com.techstore.entity.settings.SystemLog> logs;
        boolean isAllStatus = status == null || status.equalsIgnoreCase("ALL");
        
        if (!isAllStatus) {
            logs = logRepository.findByStatusAndTimestampBetween(status, start, end, Pageable.unpaged()).getContent();
        } else {
            logs = logRepository.findByTimestampBetween(start, end, Pageable.unpaged()).getContent();
        }
        
        StringBuilder csv = new StringBuilder();
        csv.append("ID,Timestamp,Username,Action,Status,IP Address,Message\n");
        
        for (com.techstore.entity.settings.SystemLog log : logs) {
            csv.append(String.format("%s,%s,%s,%s,%s,%s,\"%s\"\n",
                log.getId(),
                log.getTimestamp(),
                log.getUsername(),
                log.getAction(),
                log.getStatus(),
                log.getIpAddress(),
                log.getMessage().replace("\"", "'")
            ));
        }
        
        byte[] bytes = csv.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
        
        return org.springframework.http.ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=system_logs.csv")
                .contentType(org.springframework.http.MediaType.parseMediaType("text/csv"))
                .body(bytes);
    }
}
