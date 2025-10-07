package com.fpt.evcare.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ServiceTypeVehiclePartResponse implements Serializable {

    UUID serviceTypeVehiclePartId;

    ServiceTypeResponse serviceType;

    VehiclePartResponse vehiclePart;

    Integer requiredQuantity;

    Integer estimatedTimeDefault;

    Boolean isDeleted;

    Boolean isActive;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;

    String createdBy;

    String updatedBy;
}
