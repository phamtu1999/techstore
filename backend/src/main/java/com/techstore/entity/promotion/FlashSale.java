package com.techstore.entity.promotion;

import com.techstore.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "flash_sales")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FlashSale extends BaseEntity {

    @Column(nullable = false)
    String name;

    @Column(nullable = false)
    Instant startDate;

    @Column(nullable = false)
    Instant endDate;

    @Builder.Default
    boolean active = true;

    @OneToMany(mappedBy = "flashSale", cascade = CascadeType.ALL, orphanRemoval = true)
    List<FlashSaleItem> items;
}
