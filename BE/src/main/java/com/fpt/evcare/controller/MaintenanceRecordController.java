package com.fpt.evcare.controller;

import com.fpt.evcare.base.ApiResponse;
import com.fpt.evcare.constants.MaintenanceRecordConstants;
import com.fpt.evcare.dto.request.maintain_record.CreationMaintenanceRecordRequest;
import com.fpt.evcare.dto.request.maintain_record.UpdationMaintenanceRecordRequest;
import com.fpt.evcare.service.MaintenanceRecordService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping(MaintenanceRecordConstants.BASE_URL)
public class MaintenanceRecordController {

    MaintenanceRecordService maintenanceRecordService;

    @PostMapping(MaintenanceRecordConstants.MAINTENANCE_RECORD_CREATION)
    @Operation(summary = "Tạo phiếu bảo dưỡng mới", description = "Tạo mới phiếu bảo dưỡng gắn với một Maintenance Management")
    public ResponseEntity<ApiResponse<String>> addMaintenanceRecord(@PathVariable("maintenance_management_id") UUID maintenanceManagementId, @RequestBody CreationMaintenanceRecordRequest creationRequest) {

        maintenanceRecordService.addMaintenanceRecords(maintenanceManagementId, creationRequest);

        log.info(MaintenanceRecordConstants.LOG_SUCCESS_CREATING_MAINTENANCE_RECORD);
        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .success(true)
                        .message(MaintenanceRecordConstants.MESSAGE_SUCCESS_CREATING_MAINTENANCE_RECORD)
                        .build()
        );
    }

    @PatchMapping(MaintenanceRecordConstants.MAINTENANCE_RECORD_UPDATE)
    @Operation(summary = "Cập nhật phiếu bảo dưỡng", description = "Cập nhật thông tin hoặc số lượng phụ tùng sử dụng trong phiếu bảo dưỡng")
    public ResponseEntity<ApiResponse<String>> updateMaintenanceRecord(@PathVariable("id") UUID id, @RequestBody UpdationMaintenanceRecordRequest updateRequest) {

        boolean result = maintenanceRecordService.updateMaintenanceRecord(id, updateRequest);

        log.info(MaintenanceRecordConstants.LOG_SUCCESS_UPDATING_MAINTENANCE_RECORD, id);
        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .success(result)
                        .message(MaintenanceRecordConstants.MESSAGE_SUCCESS_UPDATING_MAINTENANCE_RECORD)
                        .build()
        );
    }

    @DeleteMapping(MaintenanceRecordConstants.MAINTENANCE_RECORD_DELETE)
    @Operation(summary = "Xóa phiếu bảo dưỡng", description = "Xóa một phiếu bảo dưỡng và hoàn lại phụ tùng đã dùng vào kho")
    public ResponseEntity<ApiResponse<String>> deleteMaintenanceRecord(@PathVariable("id") UUID id) {

        boolean result = maintenanceRecordService.deleteMaintenanceRecord(id);

        log.info(MaintenanceRecordConstants.LOG_SUCCESS_DELETING_MAINTENANCE_RECORD, id);
        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .success(result)
                        .message(MaintenanceRecordConstants.MESSAGE_SUCCESS_DELETING_MAINTENANCE_RECORD)
                        .build()
        );
    }
}
