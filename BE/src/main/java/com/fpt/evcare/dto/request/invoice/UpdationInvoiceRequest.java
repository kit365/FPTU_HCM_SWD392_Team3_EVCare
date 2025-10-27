package com.fpt.evcare.dto.request.invoice;

import jakarta.validation.constraints.DecimalMin;
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
public class UpdationInvoiceRequest {

    UUID paymentMethodId;

    @DecimalMin(value = "0.0", message = "Tổng tiền phải lớn hơn hoặc bằng 0")
    BigDecimal totalAmount;

    @DecimalMin(value = "0.0", message = "Số tiền đã thanh toán phải lớn hơn hoặc bằng 0")
    BigDecimal paidAmount;

    String status;

    LocalDateTime dueDate;

    String notes;
}
