package com.fpt.evcare.mapper;

import com.fpt.evcare.dto.request.maintenance_management.CreationMaintenanceManagementRequest;
import com.fpt.evcare.dto.request.maintenance_management.UpdationMaintenanceManagementRequest;
import com.fpt.evcare.dto.response.MaintenanceManagementResponse;
import com.fpt.evcare.entity.MaintenanceManagementEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface MaintenanceManagementMapper {
    @Mapping(target = "maintenanceManagementId", ignore = true)
    @Mapping(target = "appointment", ignore = true)
    @Mapping(target = "search", ignore = true)
    @Mapping(target = "maintenanceRecords", ignore = true)
    @Mapping(target = "startTime", ignore = true)
    @Mapping(target = "endTime", ignore = true)
    @Mapping(target = "totalCost", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "serviceType", ignore = true)
    MaintenanceManagementEntity toEntity(CreationMaintenanceManagementRequest creationMaintenanceManagementRequest);

    @Mapping(target = "appointmentResponse", ignore = true)
    @Mapping(target = "maintenanceRecords", ignore = true)
    @Mapping(target = "serviceTypeResponse", ignore = true)
    MaintenanceManagementResponse toResponse(MaintenanceManagementEntity maintenanceManagement);

    @Mapping(target = "maintenanceManagementId", ignore = true)
    @Mapping(target = "appointment", ignore = true)
    @Mapping(target = "serviceType", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "search", ignore = true)
    @Mapping(target = "maintenanceRecords", ignore = true)
    @Mapping(target = "startTime", ignore = true)
    @Mapping(target = "endTime", ignore = true)
    @Mapping(target = "totalCost", ignore = true)
    void toUpdate(@MappingTarget MaintenanceManagementEntity maintenanceManagementEntity, UpdationMaintenanceManagementRequest updationMaintenanceManagementRequest);
}
