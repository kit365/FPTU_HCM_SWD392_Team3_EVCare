package com.fpt.evcare.dto.request.payment_method;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdationPaymentMethodRequest {

    String methodType;

    String provider;

    String accountNumber;

    LocalDateTime expiryDate;

    Boolean isDefault;

    String status;

    String note;
}
