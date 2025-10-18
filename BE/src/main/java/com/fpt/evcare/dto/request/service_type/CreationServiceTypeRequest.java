package com.fpt.evcare.dto.request.service_type;

import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreationServiceTypeRequest {

    @NotBlank(message = "Tên dịch vụ không được để trống")
    @Size(max = 100, message = "Tên dịch vụ không được vượt quá 100 kí tự")
    String serviceName;

    @Nullable
    String description;

    @Nullable
    UUID parentId;

    @NotNull(message = "Loại xe không được để trống")
    UUID vehicleTypeId;
}
