package com.fpt.evcare.mapper;

import com.fpt.evcare.dto.request.maintain_record.CreationMaintenanceRecordRequest;
import com.fpt.evcare.dto.request.maintain_record.UpdationMaintenanceRecordRequest;
import com.fpt.evcare.dto.response.MaintenanceRecordResponse;
import com.fpt.evcare.entity.MaintenanceRecordEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface MaintenanceRecordMapper {
    @Mapping(target = "maintenanceRecordId", ignore = true)
    @Mapping(target = "maintenanceManagement", ignore = true)
    @Mapping(target = "vehiclePart", ignore = true)
    @Mapping(target = "quantityUsed", ignore = true)
    MaintenanceRecordEntity toEntity (CreationMaintenanceRecordRequest creationMaintenanceRecordRequest);


    @Mapping(target = "vehiclePartResponse", ignore = true)
    @Mapping(target = "maintenanceRecordId", source = "maintenanceRecordId")
    MaintenanceRecordResponse toResponse (MaintenanceRecordEntity maintenanceRecordEntity);

    @Mapping(target = "maintenanceRecordId", ignore = true)
    @Mapping(target = "maintenanceManagement", ignore = true)
    @Mapping(target = "vehiclePart", ignore = true)
    @Mapping(target = "quantityUsed", ignore = true)
    void toUpdate(@MappingTarget MaintenanceRecordEntity maintenanceRecordEntity, UpdationMaintenanceRecordRequest updationMaintenanceRecordRequest);
}
