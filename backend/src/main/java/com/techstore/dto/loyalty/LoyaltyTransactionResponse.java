package com.techstore.dto.loyalty;

import com.techstore.entity.loyalty.LoyaltySource;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LoyaltyTransactionResponse {
    String id;
    Integer points;
    LoyaltySource source;
    String description;
    String orderId;
    Instant createdAt;
}
