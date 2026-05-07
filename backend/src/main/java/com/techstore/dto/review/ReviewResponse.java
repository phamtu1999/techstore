package com.techstore.dto.review;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private String id;
    private String productId;
    private String username;
    private Integer rating;
    private String comment;
    private boolean verified;
    private List<String> imageUrls;
    private Instant createdAt;
}
