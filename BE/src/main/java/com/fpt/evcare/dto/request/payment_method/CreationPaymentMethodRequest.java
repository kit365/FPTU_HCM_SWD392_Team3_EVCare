package com.fpt.evcare.dto.request.payment_method;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreationPaymentMethodRequest {

    UUID userId;

    @NotNull(message = "Loại phương thức thanh toán không được để trống")
    String methodType;

    String provider;

    String accountNumber;

    LocalDateTime expiryDate;

    Boolean isDefault;

    String status;

    String note;
}
