package com.techstore.entity.review;

import com.techstore.entity.base.BaseEntity;
import com.techstore.entity.product.Product;
import com.techstore.entity.user.User;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "reviews",
        uniqueConstraints = {
            @UniqueConstraint(columnNames = {"user_id", "product_id"}) // ensure one review per product-user
        },
        indexes = {
            @Index(name = "idx_reviews_product_created", columnList = "product_id, created_at"),
            @Index(name = "idx_reviews_user_created", columnList = "user_id, created_at")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer rating; // 1-5 stars

    @Column(length = 1000)
    private String comment;

    @Column(nullable = false)
    @Builder.Default
    private boolean isVerifiedPurchase = false;

    @Column(name = "helpful_count")
    @Builder.Default
    private Integer helpfulCount = 0;

    // Shop reply
    @Column(length = 1000)
    private String replyComment;

    private Instant replyDate;

    @OneToMany(mappedBy = "review", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReviewImage> images;
}
