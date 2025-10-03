package com.fpt.evcare.dto.response;

import com.fpt.evcare.enums.VehiclePartStatusEnum;
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
public class VehiclePartResponse implements Serializable {

    UUID vehiclePartId;

    String vehiclePartName;

    VehicleTypeResponse vehicleType;

    VehiclePartCategoryResponse vehiclePartCategory;

    int currentQuantity;

    int minStock;

    float unitPrice;

    LocalDateTime lastRestockDate;

    VehiclePartStatusEnum status;

    String note;

    Boolean isDeleted;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;

    String createdBy;

    String updatedBy;
}
