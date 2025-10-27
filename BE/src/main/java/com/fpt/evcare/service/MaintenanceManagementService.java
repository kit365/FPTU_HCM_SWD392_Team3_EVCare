package com.fpt.evcare.service;

import com.fpt.evcare.dto.request.maintenance_management.CreationMaintenanceManagementRequest;
import com.fpt.evcare.dto.request.maintenance_management.UpdationMaintenanceManagementRequest;
import com.fpt.evcare.dto.response.MaintenanceManagementResponse;
import com.fpt.evcare.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface MaintenanceManagementService {
    MaintenanceManagementResponse getMaintenanceManagementEntityById(String keyword, Pageable pageable, UUID id);
    List<String> getMaintenanceManagementStatuses();
    PageResponse<MaintenanceManagementResponse> searchMaintenanceManagement(String keyword, Pageable pageable);
    PageResponse<MaintenanceManagementResponse> searchMaintenanceManagementForTechnicians(UUID technicianId, String keyword, Pageable pageable);
    void addMaintenanceManagement(CreationMaintenanceManagementRequest request);
    boolean updateStartEndStartMaintenanceManagement(UUID id, UpdationMaintenanceManagementRequest updationMaintenanceManagementRequest);
    boolean updateNotesMaintenanceManagement(UUID id, String notes);
    boolean updateMaintenanceManagementStatus(UUID id, String status);
}
