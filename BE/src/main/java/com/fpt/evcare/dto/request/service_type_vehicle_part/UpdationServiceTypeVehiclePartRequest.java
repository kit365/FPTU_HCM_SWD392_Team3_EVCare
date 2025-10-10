package com.fpt.evcare.dto.request.service_type_vehicle_part;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdationServiceTypeVehiclePartRequest {

    @NotNull(message = "Service type ID không được để trống")
    UUID serviceTypeId;

    @NotNull(message = "Vehicle part ID không được để trống")
    UUID vehiclePartId;

    @NotNull(message = "Số lượng yêu cầu không được để trống")
    @Min(value = 1, message = "Số lượng yêu cầu phải là số nguyên dương")
    Integer requiredQuantity;

    @NotNull(message = "Thời gian ước tính không được để trống")
    @Min(value = 1, message = "Thời gian ước tính phải là số nguyên dương")
    Integer estimatedTimeDefault;

    Boolean isActive;

    Boolean isDeleted;

    String createdBy;

    String updatedBy;
}
