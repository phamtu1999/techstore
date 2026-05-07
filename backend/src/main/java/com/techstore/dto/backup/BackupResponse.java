package com.techstore.dto.backup;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BackupResponse {
    private String fileName;
    private String fileSize;
    
    private Instant createdAt;
    
    private String downloadUrl;
}
