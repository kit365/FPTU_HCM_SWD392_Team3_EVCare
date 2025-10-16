package com.fpt.evcare.dto.request.vehicle_part;

import com.fpt.evcare.enums.VehiclePartStatusEnum;
import jakarta.validation.constraints.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdationVehiclePartRequest implements Serializable {

    @NotBlank(message = "Tên phụ tùng không được để trống")
    @Size(min = 3, max = 255, message = "Tên phụ tùng phải chứa ít nhất từ 3 đến 255 kí tự")
    String vehiclePartName;

    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 1, message = "Số lượng phải có ít nhất từ 1")
    @PositiveOrZero(message = "Số lượng phải là số không âm")
    Integer currentQuantity;

    @PositiveOrZero(message = "Số lượng phải là số không âm")
    @Min(value = 1, message = "Số lượng tồn tối thiểu phải có ít nhất từ 1")
    Integer minStock;

    @Min(value = 1, message = "Giá thành phải có ít nhất từ 1")
    @PositiveOrZero(message = "Giá thành phải là số không âm")
    Float unitPrice;

    VehiclePartStatusEnum status;

    @NotNull(message = "Tuổi thọ trung bình không được để trống")
    @Min(value = 0, message = "Tuổi thọ trung bình không được nhỏ hơn 0")
    @Max(value = 100, message = "Tuổi thọ trung bình không được vượt quá 100 năm")
    @PositiveOrZero(message = "Tuổi thọ trung bình phải là số không âm")
    Integer averageLifespan;

    String note;

    @NotNull(message = "Danh mục phụ tùng không được để trống")
    UUID vehiclePartCategoryId;

    boolean isActive;

    boolean isDeleted;

    String createdBy;

    String updatedBy;
}
