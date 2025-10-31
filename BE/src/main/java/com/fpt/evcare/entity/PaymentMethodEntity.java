package com.fpt.evcare.entity;

import com.fpt.evcare.base.BaseEntity;
import com.fpt.evcare.enums.MethodTypeEnum;
import com.fpt.evcare.enums.PaymentMethodStatusEnum;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "payment_methods")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentMethodEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    UUID paymentMethodId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    UserEntity user;

    @Column(name = "method_type", nullable = false)
    @Enumerated(EnumType.STRING)
    MethodTypeEnum methodType;

    @Column(name = "provider", length = 50)
    String provider;

    @Column(name = "account_number", length = 50)
    String accountNumber;

    @Column(name = "expiry_date")
    LocalDateTime expiryDate;

    @Column(name = "is_default")
    @Builder.Default
    Boolean isDefault = false;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    PaymentMethodStatusEnum status = PaymentMethodStatusEnum.ACTIVE;

    @Column(name = "last_used_at")
    LocalDateTime lastUsedAt;

    @Column(name = "note", length = 500)
    String note;

    @Column(name = "search", length = 255)
    String search;
}
