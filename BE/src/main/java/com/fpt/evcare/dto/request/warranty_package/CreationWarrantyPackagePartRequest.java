package com.fpt.evcare.dto.request.warranty_package;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreationWarrantyPackagePartRequest {

    @NotNull(message = "ID phụ tùng không được để trống")
    UUID vehiclePartId;

    UUID vehicleId; // Optional - có thể null nếu là gói bảo hành tổng quát

    @NotNull(message = "Ngày lắp đặt không được để trống")
    LocalDateTime installedDate;

    LocalDateTime warrantyExpiryDate; // Optional - có thể tự động tính từ warrantyPeriodMonths

    String notes;
}

