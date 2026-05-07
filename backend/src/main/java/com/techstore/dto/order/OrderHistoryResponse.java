package com.techstore.dto.order;

import com.techstore.entity.order.OrderStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderHistoryResponse {
    String id;
    OrderStatus status;
    String description;
    Instant createdAt;
}
