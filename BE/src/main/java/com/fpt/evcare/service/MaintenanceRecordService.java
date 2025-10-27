package com.fpt.evcare.service;

import com.fpt.evcare.dto.request.maintain_record.CreationMaintenanceRecordRequest;
import com.fpt.evcare.dto.request.maintain_record.UpdationMaintenanceRecordRequest;
import com.fpt.evcare.dto.response.MaintenanceRecordResponse;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.entity.MaintenanceManagementEntity;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface MaintenanceRecordService {
    PageResponse<MaintenanceRecordResponse> searchMaintenanceRecordByMaintenanceManagement(UUID maintenanceManagementId, String keyword, Pageable pageable);
    void addMaintenanceRecordsForMaintenanceManagement(MaintenanceManagementEntity maintenanceManagementEntity, List<CreationMaintenanceRecordRequest> creationMaintenanceRecordRequests);
    void addMaintenanceRecords(UUID mantenanceId, CreationMaintenanceRecordRequest creationMaintenanceRecordRequest);
    boolean updateMaintenanceRecord(UUID id, UpdationMaintenanceRecordRequest updationMaintenanceRecordRequest);
    boolean deleteMaintenanceRecord(UUID id);
}
