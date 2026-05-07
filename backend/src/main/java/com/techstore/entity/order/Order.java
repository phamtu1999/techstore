package com.techstore.entity.order;

import com.techstore.entity.base.BaseEntity;
import com.techstore.entity.user.User;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    // Denormalized snapshot of address at the time of order
    @Column(nullable = false, length = 1000)
    private String shippingAddress; 
    
    @Column(nullable = false)
    private String receiverName;

    @Column(nullable = false)
    private String receiverPhone;

    // Financials using BigDecimal
    @Column(nullable = false)
    private BigDecimal subTotal;

    @Column(nullable = false)
    private BigDecimal shippingFee;

    @Column(nullable = false)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal totalAmount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coupon_id")
    private Coupon coupon;

    private String note;

    @Column(unique = true)
    private String idempotencyKey; // Prevents duplicate orders

    @Column(name = "points_spent")
    private Integer pointsSpent;

    @Column(name = "points_earned")
    private Integer pointsEarned;

    @org.hibernate.annotations.BatchSize(size = 20)
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items;

    @org.hibernate.annotations.BatchSize(size = 20)
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt DESC")
    private List<OrderHistory> timeline;
}
