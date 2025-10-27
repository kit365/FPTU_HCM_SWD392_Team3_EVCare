package com.fpt.evcare.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fpt.evcare.enums.InvoiceStatusEnum;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder
public class InvoiceResponse implements Serializable {

    UUID invoiceId;

    AppointmentResponse appointment;

    PaymentMethodResponse paymentMethod;

    BigDecimal totalAmount;

    BigDecimal paidAmount;

    InvoiceStatusEnum status;

    LocalDateTime invoiceDate;

    LocalDateTime dueDate;

    String notes;

    Boolean isActive;

    Boolean isDeleted;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;

    String createdBy;

    String updatedBy;
}
