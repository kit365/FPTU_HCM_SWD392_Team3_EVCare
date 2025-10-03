package com.fpt.evcare.dto.request.vehicle_part_category;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreationVehiclePartCategoryRequest {

    @NotBlank(message = "Danh mục phụ tùng không được để trống")
    @Size(min = 3, max = 100, message = "Tên danh mục phụ tùng có ít nhất 3 đến 100 kí tự")
    String partCategoryName;

    String description;

    @NotNull(message = "Tuổi thọ trung bình không được để trống")
    @Min(value = 0, message = "Tuổi thọ trung bình không được nhỏ hơn 0")
    @Max(value = 100, message = "Tuổi thọ trung bình không được vượt quá 100 năm")
    @PositiveOrZero(message = "Tuổi thọ trung bình phải là số không âm")
    Integer averageLifespan;
}
