package com.fpt.evcare.entity;

import com.fpt.evcare.base.BaseEntity;
import com.fpt.evcare.enums.PaymentGatewayEnum;
import com.fpt.evcare.enums.PaymentTransactionStatusEnum;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "payment_transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentTransactionEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    UUID transactionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id")
    InvoiceEntity invoice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    AppointmentEntity appointment;

    @Column(name = "gateway", nullable = false)
    @Enumerated(EnumType.STRING)
    PaymentGatewayEnum gateway;

    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    BigDecimal amount;

    @Column(name = "currency", length = 3)
    @Builder.Default
    String currency = "VND";

    @Column(name = "transaction_reference", unique = true, nullable = false, length = 100)
    String transactionReference;

    @Column(name = "payment_url", length = 2000)
    String paymentUrl;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    PaymentTransactionStatusEnum status = PaymentTransactionStatusEnum.PENDING;

    @Column(name = "transaction_response", length = 1000)
    String transactionResponse;

    @Column(name = "payment_date")
    LocalDateTime paymentDate;

    @Column(name = "gateway_transaction_id", length = 100)
    String gatewayTransactionId;

    @Column(name = "customer_info", length = 500)
    String customerInfo;

    @Column(name = "notes", length = 500)
    String notes;

    @Column(name = "search", length = 255)
    String search;
}
