package com.fpt.evcare.dto.request.warranty_part;

import com.fpt.evcare.enums.ValidityPeriodUnitEnum;
import com.fpt.evcare.enums.WarrantyDiscountTypeEnum;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdationWarrantyPartRequest {

    @NotNull(message = "Phụ tùng không được để trống")
    UUID vehiclePartId;

    @NotNull(message = "Loại giảm giá không được để trống")
    WarrantyDiscountTypeEnum discountType;

    @DecimalMin(value = "0.0", message = "Giá trị giảm giá phải lớn hơn hoặc bằng 0")
    @DecimalMax(value = "100.0", message = "Giá trị giảm giá phải nhỏ hơn hoặc bằng 100")
    BigDecimal discountValue; // Phần trăm giảm giá (0-100) nếu discountType = PERCENTAGE, null nếu discountType = FREE

    @NotNull(message = "Thời gian hiệu lực không được để trống")
    @Min(value = 1, message = "Thời gian hiệu lực phải lớn hơn 0")
    @Positive(message = "Thời gian hiệu lực phải là số dương")
    Integer validityPeriod; // Số (2, 3, ...)

    @NotNull(message = "Đơn vị thời gian hiệu lực không được để trống")
    ValidityPeriodUnitEnum validityPeriodUnit; // DAY, MONTH, YEAR

    Boolean isActive;
}
