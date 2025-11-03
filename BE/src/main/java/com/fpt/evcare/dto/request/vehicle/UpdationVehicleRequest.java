package com.fpt.evcare.dto.request.vehicle;

import com.fpt.evcare.base.BaseEntity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdationVehicleRequest implements Serializable {

    UUID userId;

    UUID vehicleTypeId;

    String plateNumber;

    @Size(min = 1, message = "Khung xe phải có ít nhất 1 kí tự")
    String vin;

    Float currentKm;

    LocalDateTime lastMaintenanceDate;

    Float lastMaintenanceKm;

    String notes;

    String phoneNumber;
}
