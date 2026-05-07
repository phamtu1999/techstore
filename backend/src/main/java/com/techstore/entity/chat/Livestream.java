package com.techstore.entity.chat;

import com.techstore.entity.base.BaseEntity;
import com.techstore.entity.product.Product;
import com.techstore.entity.user.User;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.Instant;

@Entity
@Table(name = "livestreams")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Livestream extends BaseEntity {
    
    @Column(nullable = false)
    String title;
    
    @Column(columnDefinition = "TEXT")
    String description;
    
    String thumbnailUrl;
    String streamUrl;
    
    @Enumerated(EnumType.STRING)
    @Builder.Default
    LivestreamStatus status = LivestreamStatus.UPCOMING;
    
    @Builder.Default
    Integer viewerCount = 0;
    
    @ManyToOne
    @JoinColumn(name = "active_product_id")
    Product activeProduct;
    
    @ManyToOne
    @JoinColumn(name = "streamer_id")
    User streamer;
    
    Instant startTime;
    Instant endTime;

    public enum LivestreamStatus {
        UPCOMING, LIVE, ENDED
    }
}
