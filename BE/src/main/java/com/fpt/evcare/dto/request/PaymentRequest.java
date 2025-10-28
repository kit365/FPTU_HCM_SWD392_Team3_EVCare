package com.fpt.evcare.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentRequest {
    String paymentMethod; // "CASH", "BANK_TRANSFER", "VNPAY", etc.
    BigDecimal paidAmount;
    String notes;
}

