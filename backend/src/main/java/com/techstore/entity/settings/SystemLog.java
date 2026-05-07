package com.techstore.entity.settings;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "system_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemLog {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String action;      // Tên hành động: CREATE_ORDER, LOGIN, DELETE_PRODUCT...
    
    @Column(columnDefinition = "TEXT")
    private String message;     // Chi tiết: "Người dùng admin đã tạo đơn hàng #123"
    
    private String username;    // Ai thực hiện
    
    private String ipAddress;   // Địa chỉ IP thực hiện
    
    private String status;      // SUCCESS hoặc FAILURE
    
    @Column(columnDefinition = "TEXT")
    private String details;     // Dữ liệu JSON chi tiết (ví dụ: payload đơn hàng, lỗi stacktrace)

    @CreationTimestamp
    private Instant timestamp;
}
