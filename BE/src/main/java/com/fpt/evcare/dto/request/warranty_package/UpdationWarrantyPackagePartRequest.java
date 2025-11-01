package com.fpt.evcare.dto.request.warranty_package;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdationWarrantyPackagePartRequest {

    UUID vehicleId; // Optional

    LocalDateTime installedDate;

    LocalDateTime warrantyExpiryDate;

    String notes;

    Boolean isActive;
}

