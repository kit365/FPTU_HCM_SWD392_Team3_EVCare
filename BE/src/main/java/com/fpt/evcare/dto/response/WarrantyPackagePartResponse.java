package com.fpt.evcare.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class WarrantyPackagePartResponse implements Serializable {

    UUID warrantyPackagePartId;

    WarrantyPackageResponse warrantyPackage;

    VehicleResponse vehicle; // Optional

    VehiclePartResponse vehiclePart;

    LocalDateTime installedDate;

    LocalDateTime warrantyExpiryDate;

    String notes;

    Boolean isActive;

    Boolean isDeleted;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;

    String createdBy;

    String updatedBy;
}

