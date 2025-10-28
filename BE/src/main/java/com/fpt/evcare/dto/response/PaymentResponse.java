package com.fpt.evcare.dto.response;

import com.fpt.evcare.enums.PaymentGatewayEnum;
import com.fpt.evcare.enums.PaymentTransactionStatusEnum;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentResponse {
    UUID transactionId;
    UUID invoiceId;
    UUID appointmentId;
    PaymentGatewayEnum gateway;
    BigDecimal amount;
    String currency;
    String transactionReference;
    String paymentUrl;
    PaymentTransactionStatusEnum status;
    LocalDateTime createdAt;
    LocalDateTime paymentDate;
    String gatewayTransactionId;
    String customerInfo;
}
