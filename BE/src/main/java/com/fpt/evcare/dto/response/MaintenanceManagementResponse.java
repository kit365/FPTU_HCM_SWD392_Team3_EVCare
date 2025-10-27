package com.fpt.evcare.dto.response;

import com.fpt.evcare.enums.MaintenanceManagementStatusEnum;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MaintenanceManagementResponse implements Serializable {

    UUID maintenanceManagementId;

    AppointmentResponse appointmentResponse;

    ServiceTypeResponse serviceTypeResponse;

    LocalDateTime startTime;

    LocalDateTime endTime;

    BigDecimal totalCost;

    MaintenanceManagementStatusEnum status;

    String notes;

    PageResponse<MaintenanceRecordResponse> maintenanceRecords;

    Boolean isActive;

    Boolean isDeleted;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;

    String createdBy;

    String updatedBy;
}
