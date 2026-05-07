package com.techstore.entity.backup;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "backups")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Backup {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String fileName;
    private String fileSize;
    private String storagePath;
    @Column(length = 2048)
    private String storageUrl;
    
    @CreationTimestamp
    private Instant createdAt;
}
