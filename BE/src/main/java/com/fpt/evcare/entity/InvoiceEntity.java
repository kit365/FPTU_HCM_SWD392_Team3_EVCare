package com.fpt.evcare.entity;

import com.fpt.evcare.base.BaseEntity;
import com.fpt.evcare.enums.InvoiceStatusEnum;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "invoices")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InvoiceEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    UUID invoiceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    AppointmentEntity appointment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_method_id", nullable = true) // Cho phép null vì khách hàng sẽ chọn phương thức thanh toán sau
    PaymentMethodEntity paymentMethod;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "paid_amount", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    BigDecimal paidAmount = BigDecimal.ZERO;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    InvoiceStatusEnum status = InvoiceStatusEnum.PENDING;

    @Column(name = "invoice_date", nullable = false)
    LocalDateTime invoiceDate;

    @Column(name = "due_date")
    LocalDateTime dueDate;

    @Column(name = "notes", length = 500)
    String notes;

    @Column(name = "search", length = 255)
    String search;
}
