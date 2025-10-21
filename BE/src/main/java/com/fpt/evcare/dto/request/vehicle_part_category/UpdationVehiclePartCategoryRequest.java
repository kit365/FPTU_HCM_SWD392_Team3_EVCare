package com.fpt.evcare.dto.request.vehicle_part_category;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdationVehiclePartCategoryRequest {

    @NotBlank(message = "Danh mục phụ tùng không được để trống")
    @Size(min = 3, max = 100, message = "Tên danh mục phụ tùng có ít nhất 3 đến 100 kí tự")
    String partCategoryName;

    String description;

    Boolean isActive;

    Boolean isDeleted;

    String createdBy;

    String updatedBy;
}
