package com.fpt.evcare.dto.request.invoice;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
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
public class CreationInvoiceRequest {

    UUID appointmentId;

    @NotNull(message = "Phương thức thanh toán không được để trống")
    UUID paymentMethodId;

    @NotNull(message = "Tổng tiền không được để trống")
    @DecimalMin(value = "0.0", message = "Tổng tiền phải lớn hơn hoặc bằng 0")
    BigDecimal totalAmount;

    @NotNull(message = "Số tiền đã thanh toán không được để trống")
    @DecimalMin(value = "0.0", message = "Số tiền đã thanh toán phải lớn hơn hoặc bằng 0")
    BigDecimal paidAmount;

    String status;

    LocalDateTime invoiceDate;

    LocalDateTime dueDate;

    String notes;
}
