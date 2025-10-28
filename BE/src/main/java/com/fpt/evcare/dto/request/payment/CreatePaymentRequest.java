package com.fpt.evcare.dto.request.payment;

import com.fpt.evcare.enums.PaymentGatewayEnum;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreatePaymentRequest {
    UUID invoiceId;
    UUID appointmentId;
    PaymentGatewayEnum gateway;
    BigDecimal amount;
    String currency;
    String customerInfo;
    String orderDescription;
}
