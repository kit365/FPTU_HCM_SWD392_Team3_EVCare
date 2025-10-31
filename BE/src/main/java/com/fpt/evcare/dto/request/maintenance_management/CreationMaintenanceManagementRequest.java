package com.fpt.evcare.dto.request.maintenance_management;

import com.fpt.evcare.dto.request.maintain_record.CreationMaintenanceRecordRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreationMaintenanceManagementRequest {

    @NotNull(message = "Mã lịch hẹn không được để trống")
    UUID appointmentId;

    @NotNull(message = "Mã loại dịch vụ không được để trống")
    UUID serviceTypeId;

    @NotNull(message = "Thời gian bắt đầu không được để trống")
    LocalDateTime startTime;

    @NotNull(message = "Thời gian kết thúc không được để trống")
    LocalDateTime endTime;

    @DecimalMin(value = "0.0", inclusive = true, message = "Tổng chi phí phải lớn hơn hoặc bằng 0")
    BigDecimal totalCost;

    @Size(max = 255, message = "Ghi chú không được vượt quá 255 ký tự")
    String notes;

    @NotEmpty(message = "Danh sách phụ tùng bảo dưỡng không được để trống")
    @Valid
    List<CreationMaintenanceRecordRequest> creationMaintenanceRecordRequests;
}
