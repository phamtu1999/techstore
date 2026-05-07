package com.techstore.dto.inventory;

import com.techstore.entity.inventory.TransactionType;
import lombok.*;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryTransactionResponse {
    private String id;
    private String variantId;
    private String variantName;
    private String sku;
    private TransactionType transactionType;
    private Integer quantity;
    private Integer balanceAfter;
    private String referenceNumber;
    private String note;
    private String createdBy;
    private String warehouseLocation;
    private Instant createdAt;
}
