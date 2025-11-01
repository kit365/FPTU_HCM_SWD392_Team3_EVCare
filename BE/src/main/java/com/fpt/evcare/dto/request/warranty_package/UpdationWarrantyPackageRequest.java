package com.fpt.evcare.dto.request.warranty_package;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdationWarrantyPackageRequest {

    @NotBlank(message = "Tên gói bảo hành không được để trống")
    @Size(min = 3, max = 255, message = "Tên gói bảo hành phải từ 3 đến 255 ký tự")
    String warrantyPackageName;

    @Size(max = 500, message = "Mô tả không được vượt quá 500 ký tự")
    String description;

    @NotNull(message = "Thời gian bảo hành (tháng) không được để trống")
    @Min(value = 1, message = "Thời gian bảo hành phải ít nhất 1 tháng")
    @Max(value = 120, message = "Thời gian bảo hành không được vượt quá 120 tháng")
    Integer warrantyPeriodMonths;

    @NotNull(message = "Ngày bắt đầu không được để trống")
    LocalDateTime startDate;

    @NotNull(message = "Ngày kết thúc không được để trống")
    LocalDateTime endDate;

    Boolean isActive;
}

