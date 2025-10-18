package com.fpt.evcare.dto.request.vehicle_type;

import jakarta.validation.constraints.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;



@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreationVehicleTypeRequest{

    @NotBlank(message = "Tên loại xe không được để trống")
    @Size(min = 3, max = 100, message = "Tên loại xe phải từ 3 đến 100 ký tự")
    String vehicleTypeName;

    @NotBlank(message = "Nhà sản xuất không được để trống")
    @Size(max = 100, message = "Nhà sản xuất không được vượt quá 100 ký tự")
    String manufacturer;

    @PositiveOrZero(message = "Số năm phải là số không âm")
    Integer modelYear;

    @Min(value = 1, message = "Dung lượng pin phải ít nhất 1 kWh")
    @PositiveOrZero(message = "Dung lượng pin phải là số không âm")
    Float batteryCapacity;

    @PositiveOrZero(message = "Khoảng cách bảo trì phải là số không âm")
    Float maintenanceIntervalKm;

    @PositiveOrZero(message = "Thời gian bảo trì phải là số không âm")
    Integer maintenanceIntervalMonths;

    @Size(max = 500, message = "Mô tả không được vượt quá 500 ký tự")
    String description;
}
