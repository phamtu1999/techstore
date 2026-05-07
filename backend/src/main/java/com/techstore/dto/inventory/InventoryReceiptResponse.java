package com.techstore.dto.inventory;

import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryReceiptResponse {
    private String id;
    private String receiptNumber;
    private String supplierName;
    private String contactNumber;
    private String note;
    private BigDecimal totalAmount;
    private String createdBy; // Name or Email of user
    private String status;
    private Instant createdAt;
}
