package com.fpt.evcare.dto.request.vehicle;

import com.fpt.evcare.base.BaseEntity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreationVehicleRequest extends BaseEntity {

    @NotBlank(message = "Người dùng không được để trống")
    UUID userId;

    @NotBlank(message = "Loại xe không được để trống")
    UUID vehicleTypeId;

    @NotBlank(message = "Biển số không được để trống")
    String plateNumber;

    @NotBlank(message = "Khung xe không được để trống")
    @Size(min = 1, message = "Khung xe phải có ít nhất 1 kí tự")
    String vin;

    Float currentKm;

    LocalDateTime lastMaintenanceDate;

    LocalDateTime lastMaintenanceKm;

    String notes;
}
