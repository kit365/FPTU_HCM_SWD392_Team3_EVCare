package com.fpt.evcare.dto.response;

import com.fpt.evcare.entity.UserEntity;
import com.fpt.evcare.entity.VehicleTypeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VehicleResponse implements Serializable {

    UUID vehicleId;


    UserResponse user;

    VehicleTypeResponse vehicleType;

    String plateNumber;

    String vin;

    Float currentKm;

    LocalDateTime lastMaintenanceDate;

    Float lastMaintenanceKm;

    String notes;

    String search;

    Boolean isDeleted;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;

    String createdBy;

    String updatedBy;

}
