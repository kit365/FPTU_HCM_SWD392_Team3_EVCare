package com.fpt.evcare.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fpt.evcare.enums.MethodTypeEnum;
import com.fpt.evcare.enums.PaymentMethodStatusEnum;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder
public class PaymentMethodResponse implements Serializable {

    UUID paymentMethodId;

    UserResponse user;

    MethodTypeEnum methodType;

    String provider;

    String accountNumber;

    LocalDateTime expiryDate;

    Boolean isDefault;

    PaymentMethodStatusEnum status;

    LocalDateTime lastUsedAt;

    String note;

    Boolean isActive;

    Boolean isDeleted;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;

    String createdBy;

    String updatedBy;
}
