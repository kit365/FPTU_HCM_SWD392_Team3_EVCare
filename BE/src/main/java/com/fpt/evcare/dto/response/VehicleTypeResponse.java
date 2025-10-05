package com.fpt.evcare.dto.response;


import com.fasterxml.jackson.annotation.JsonInclude;
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
@JsonInclude(JsonInclude.Include.NON_NULL)
public class VehicleTypeResponse implements Serializable {

    UUID vehicleTypeId;

    String vehicleTypeName;

    String manufacturer;

    Integer modelYear;

    Float batteryCapacity;

    Float maintenanceIntervalKm;

    Integer maintenanceIntervalMonths;

    String description;

    Boolean isDeleted;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;

    String createdBy;

    String updatedBy;
}
