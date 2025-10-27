package com.fpt.evcare.dto.request.maintenance_management;

import jakarta.validation.constraints.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdationMaintenanceManagementRequest {

    @NotNull(message = "Thời gian bắt đầu không được để trống")
    LocalDateTime startTime;

    @NotNull(message = "Thời gian kết thúc không được để trống")
    LocalDateTime endTime;
}
