package com.techstore.service.backup;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Paths;

@Component
@RequiredArgsConstructor
@Slf4j
public class BackupScheduler {

    private final BackupCommandService backupCommandService;

    @Value("${app.backup.dir}")
    private String backupDir;

    @Value("${app.backup.retention-count:10}")
    private int retentionCount;

    @Value("${app.backup.schedule-enabled:true}")
    private boolean scheduledBackupEnabled;

    @jakarta.annotation.PostConstruct
    public void init() {
        try {
            Files.createDirectories(Paths.get(backupDir).toAbsolutePath().normalize());
            log.info("[BACKUP][SCHEDULER] initialized backupDir={}", backupDir);
        } catch (Exception exception) {
            log.error("[BACKUP][SCHEDULER] failed to initialize backup directory", exception);
        }
    }

    @Scheduled(cron = "${app.backup.schedule-cron:0 0 2 * * *}")
    public void scheduledBackup() {
        if (!scheduledBackupEnabled) {
            log.info("[BACKUP][SCHEDULER] scheduled backup disabled");
            return;
        }

        log.info("[BACKUP][SCHEDULER] starting scheduled backup retentionCount={}", retentionCount);
        try {
            backupCommandService.createBackup();
            backupCommandService.cleanupOldBackups(retentionCount);
            log.info("[BACKUP][SCHEDULER] scheduled backup completed successfully");
        } catch (Exception exception) {
            log.error("[BACKUP][SCHEDULER] scheduled backup failed", exception);
        }
    }
}
