package com.techstore.service.backup;

import com.techstore.dto.backup.BackupResponse;
import com.techstore.entity.backup.Backup;
import com.techstore.exception.AppException;
import com.techstore.exception.ErrorCode;
import com.techstore.repository.backup.BackupRepository;
import com.techstore.service.storage.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;

@Service
@RequiredArgsConstructor
@Slf4j
public class BackupCommandService {

    private final BackupRepository backupRepository;
    private final StorageService storageService;

    @Value("${spring.datasource.username}")
    private String dbUser;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    @Value("${app.backup.db-host}")
    private String dbHost;

    @Value("${app.backup.db-port}")
    private String dbPort;

    @Value("${app.backup.db-name}")
    private String dbName;

    @Value("${app.backup.ssl-mode}")
    private String dbSslMode;

    @Value("${app.backup.dir}")
    private String backupDir;

    @Transactional
    public BackupResponse createBackup() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String fileName = "backup_" + timestamp + ".sql.gz";

        Path tempPath = null;
        try {
            Path backupRoot = getBackupRootPath();
            log.info("[BACKUP][CREATE] start fileName={} db={} host={} port={} backupDir={}", fileName, dbName, dbHost, dbPort, backupRoot);

            Files.createDirectories(backupRoot);
            tempPath = Files.createTempFile("backup_", ".sql.gz");
            log.info("[BACKUP][CREATE] temp file created at {}", tempPath);

            ProcessBuilder processBuilder = new ProcessBuilder(
                    "pg_dump", "-h", dbHost, "-p", dbPort, "-U", dbUser, "--no-owner", "--no-privileges", dbName
            );
            configureDatabaseProcess(processBuilder);
            log.info("[BACKUP][CREATE] pg_dump command prepared. PATH={}", System.getenv("PATH"));

            Process process = processBuilder.start();
            log.info("[BACKUP][CREATE] pg_dump process started");
            StringBuilder stderr = new StringBuilder();
            Thread stderrThread = startStreamCollector(process.getErrorStream(), stderr, "pg_dump");

            try (InputStream databaseDump = process.getInputStream();
                 OutputStream fileOutput = Files.newOutputStream(tempPath);
                 GZIPOutputStream gzipOutputStream = new GZIPOutputStream(fileOutput)) {
                log.info("[BACKUP][CREATE] streaming database dump into compressed file");
                databaseDump.transferTo(gzipOutputStream);
                log.info("[BACKUP][CREATE] dump stream finished");
            }

            int exitCode = process.waitFor();
            stderrThread.join();
            log.info("[BACKUP][CREATE] pg_dump finished with exitCode={}", exitCode);
            if (exitCode != 0) {
                Files.deleteIfExists(tempPath);
                String errorMsg = stderr.toString().trim();
                log.error("[BACKUP][CREATE] pg_dump failed exitCode={} stderr={}", exitCode, errorMsg);
                throw new AppException(ErrorCode.BACKUP_FAILED, "Sao lưu thất bại: " + errorMsg);
            }

            File file = tempPath.toFile();
            byte[] fileBytes = Files.readAllBytes(tempPath);
            log.info("[BACKUP][CREATE] compressed file ready sizeBytes={}", fileBytes.length);

            String uploadUrl = storageService.uploadFile(fileBytes, fileName, "backups", "application/x-gzip");
            log.info("[BACKUP][CREATE] uploaded to storage url={}", uploadUrl);

            Backup backup = backupRepository.save(Backup.builder()
                    .fileName(fileName)
                    .fileSize(formatFileSize(file.length()))
                    .storagePath("backups/" + fileName)
                    .storageUrl(uploadUrl)
                    .build());
            log.info("[BACKUP][CREATE] backup metadata saved id={} fileName={}", backup.getId(), backup.getFileName());

            return mapToResponse(backup);
        } catch (AppException e) {
            throw e;
        } catch (Exception exception) {
            log.error("[BACKUP][CREATE] failed PATH={}", System.getenv("PATH"), exception);
            throw new AppException(ErrorCode.BACKUP_FAILED, "Lỗi hệ thống khi sao lưu: " + exception.getMessage());
        } finally {
            if (tempPath != null) {
                try {
                    boolean deleted = Files.deleteIfExists(tempPath);
                    log.info("[BACKUP][CREATE] temp file cleanup path={} deleted={}", tempPath, deleted);
                } catch (IOException ignored) {}
            }
        }
    }

    @Transactional
    public BackupResponse uploadBackup(MultipartFile file) {
        try {
            String fileName = Paths.get(file.getOriginalFilename()).getFileName().toString();
            if (!fileName.endsWith(".sql.gz") && !fileName.endsWith(".sql")) {
                throw new RuntimeException("Only .sql and .sql.gz files are allowed");
            }

            String contentType = file.getContentType() != null ? file.getContentType() : "application/x-gzip";
            String uploadUrl = storageService.uploadFile(file.getBytes(), fileName, "backups", contentType);

            Backup backup = backupRepository.save(Backup.builder()
                    .fileName(fileName)
                    .fileSize(formatFileSize(file.getSize()))
                    .storagePath("backups/" + fileName)
                    .storageUrl(uploadUrl)
                    .build());

            return mapToResponse(backup);
        } catch (Exception exception) {
            log.error("Error uploading backup", exception);
            throw new RuntimeException("Could not upload backup: " + exception.getMessage());
        }
    }

    @Transactional
    public void deleteBackup(String fileName) {
        try {
            Backup backup = backupRepository.findByFileName(fileName)
                    .orElseThrow(() -> new RuntimeException("Backup record not found: " + fileName));

            storageService.deleteFile(backup.getStorageUrl());
            backupRepository.delete(backup);
        } catch (Exception exception) {
            log.error("Error deleting backup", exception);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION, "Không thể xóa bản sao lưu: " + exception.getMessage());
        }
    }

    @Transactional
    public void restoreBackup(String fileName) {
        Backup backup = backupRepository.findByFileName(fileName)
                .orElseThrow(() -> new RuntimeException("Backup record not found: " + fileName));

        Path tempPath = null;
        try {
            tempPath = Files.createTempFile("restore_", fileName.endsWith(".gz") ? ".gz" : ".sql");
            log.info("[BACKUP][RESTORE] start fileName={} storageUrl={} tempPath={}", fileName, backup.getStorageUrl(), tempPath);

            String downloadUrl = backup.getStorageUrl();
            try (InputStream remoteInput = new java.net.URL(downloadUrl).openStream();
                 OutputStream localOutput = Files.newOutputStream(tempPath)) {
                log.info("[BACKUP][RESTORE] downloading backup file from storage");
                remoteInput.transferTo(localOutput);
                log.info("[BACKUP][RESTORE] download completed sizeBytes={}", Files.size(tempPath));
            }

            ProcessBuilder processBuilder = new ProcessBuilder(
                    "psql", "-h", dbHost, "-p", dbPort, "-U", dbUser, dbName
            );
            configureDatabaseProcess(processBuilder);
            processBuilder.redirectErrorStream(true);
            log.info("[BACKUP][RESTORE] psql command prepared. PATH={}", System.getenv("PATH"));

            Process process = processBuilder.start();
            log.info("[BACKUP][RESTORE] psql process started");
            StringBuilder processOutput = new StringBuilder();
            Thread outputThread = startStreamCollector(process.getInputStream(), processOutput, "psql");

            try (InputStream backupInputStream = openBackupInputStream(tempPath);
                 OutputStream databaseInput = process.getOutputStream()) {
                log.info("[BACKUP][RESTORE] streaming backup into database");
                backupInputStream.transferTo(databaseInput);
                log.info("[BACKUP][RESTORE] stream finished");
            }

            int exitCode = process.waitFor();
            outputThread.join();
            log.info("[BACKUP][RESTORE] psql finished with exitCode={}", exitCode);
            if (exitCode != 0) {
                String errorMsg = processOutput.toString().trim();
                log.error("[BACKUP][RESTORE] psql restore failed exitCode={} output={}", exitCode, errorMsg);
                throw new AppException(ErrorCode.RESTORE_FAILED, "Phục hồi thất bại: " + errorMsg);
            }
        } catch (AppException e) {
            throw e;
        } catch (Exception exception) {
            log.error("[BACKUP][RESTORE] restore error fileName={}", fileName, exception);
            throw new AppException(ErrorCode.RESTORE_FAILED, "Lỗi hệ thống khi phục hồi: " + exception.getMessage());
        } finally {
            if (tempPath != null) {
                try {
                    boolean deleted = Files.deleteIfExists(tempPath);
                    log.info("[BACKUP][RESTORE] temp file cleanup path={} deleted={}", tempPath, deleted);
                } catch (IOException ignored) {}
            }
        }
    }

    @Transactional
    public void cleanupOldBackups(int retentionCount) {
        List<Backup> all = backupRepository.findAllByOrderByCreatedAtDesc();
        if (all.size() <= retentionCount) return;

        List<Backup> toDelete = all.subList(retentionCount, all.size());
        for (Backup backup : toDelete) {
            deleteBackup(backup.getFileName());
        }
    }

    private void configureDatabaseProcess(ProcessBuilder processBuilder) {
        processBuilder.environment().put("PGPASSWORD", dbPassword);
        processBuilder.environment().put("PGSSLMODE", dbSslMode);
    }

    private InputStream openBackupInputStream(Path path) throws IOException {
        InputStream fileInputStream = Files.newInputStream(path);
        return path.getFileName().toString().endsWith(".gz") ? new GZIPInputStream(fileInputStream) : fileInputStream;
    }

    private String formatFileSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        return String.format("%.1f %sB", bytes / Math.pow(1024, exp), "KMGTPE".charAt(exp - 1));
    }

    private Path getBackupRootPath() {
        return Paths.get(backupDir).toAbsolutePath().normalize();
    }

    private BackupResponse mapToResponse(Backup backup) {
        return BackupResponse.builder()
                .fileName(backup.getFileName())
                .fileSize(backup.getFileSize())
                .createdAt(backup.getCreatedAt())
                .downloadUrl(backup.getStorageUrl())
                .build();
    }

    private Thread startStreamCollector(InputStream inputStream, StringBuilder outputBuffer, String logPrefix) {
        Thread thread = new Thread(() -> {
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    outputBuffer.append(line).append(System.lineSeparator());
                    log.info("{}: {}", logPrefix, line);
                }
            } catch (IOException ignored) {}
        });
        thread.setDaemon(true);
        thread.start();
        return thread;
    }
}
