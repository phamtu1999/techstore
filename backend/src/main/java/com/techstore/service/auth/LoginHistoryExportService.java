package com.techstore.service.auth;

import com.techstore.entity.auth.LoginHistory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.StringWriter;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class LoginHistoryExportService {

    private final LoginHistoryQueryService loginHistoryQueryService;
    private static final DateTimeFormatter CSV_DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
            .withZone(ZoneId.of("Asia/Ho_Chi_Minh"));

    public String exportLoginHistoryToCsv(
            String username,
            Instant startDate,
            Instant endDate,
            String status
    ) throws IOException {
        // Use a large page size for export
        Page<LoginHistory> loginHistoryPage = loginHistoryQueryService.getLoginHistory(
                username, startDate, endDate, status, 0, 10000
        );

        StringWriter stringWriter = new StringWriter();
        CSVFormat csvFormat = CSVFormat.DEFAULT.builder()
                .setHeader("ID", "Username", "IP Address", "Location", "Device Info", "Status", "Timestamp", "Failure Reason")
                .build();

        try (CSVPrinter csvPrinter = new CSVPrinter(stringWriter, csvFormat)) {
            for (LoginHistory loginHistory : loginHistoryPage.getContent()) {
                csvPrinter.printRecord(
                        loginHistory.getId(),
                        loginHistory.getUsername(),
                        loginHistory.getIpAddress(),
                        loginHistory.getLocation() != null ? loginHistory.getLocation() : "Unknown",
                        loginHistory.getDeviceInfo() != null ? loginHistory.getDeviceInfo() : "Unknown",
                        loginHistory.getStatus().name(),
                        CSV_DATE_FORMATTER.format(loginHistory.getTimestamp()),
                        loginHistory.getFailureReason() != null ? loginHistory.getFailureReason() : ""
                );
            }
        }

        log.info("Exported {} login history records", loginHistoryPage.getContent().size());
        return stringWriter.toString();
    }
}
