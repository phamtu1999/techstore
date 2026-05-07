package com.techstore.entity.payment;

import com.techstore.entity.base.BaseEntity;
import com.techstore.entity.order.Order;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;

    @Column(nullable = false)
    private BigDecimal amount; // The amount paid in this transaction

    private BigDecimal fee; // Gateway fee (e.g., 1.1% + 2000)

    private String transactionId; // ID from Gateway (MoMo, VNPay)

    private String bankCode; // E.g., NCB, VCB

    private String message; // Response message or error reason

    private String ipAddress; // Customer's IP

    private Instant paymentTime; // Success time from Gateway

    @Column(columnDefinition = "TEXT")
    private String gatewayResponse; // Raw JSON response from Gateway
}
