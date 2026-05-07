package com.techstore.dto.notification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationResponse {
    String id;
    String type;
    String title;
    String message;
    boolean isRead;
    String link;
    Instant createdAt;
}
