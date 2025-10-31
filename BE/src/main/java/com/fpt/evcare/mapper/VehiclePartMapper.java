package com.fpt.evcare.mapper;

import com.fpt.evcare.dto.request.vehicle_part.CreationVehiclePartRequest;
import com.fpt.evcare.dto.request.vehicle_part.UpdationVehiclePartRequest;
import com.fpt.evcare.dto.response.VehiclePartResponse;
import com.fpt.evcare.entity.VehiclePartEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface VehiclePartMapper {

    @Mapping(target = "vehiclePartId", ignore = true)
    @Mapping(target = "search", ignore = true)
    @Mapping(target = "vehicleType", ignore = true)
    @Mapping(target = "vehiclePartCategories", ignore = true)
    @Mapping(target = "lastRestockDate", ignore = true)
    VehiclePartEntity toEntity(CreationVehiclePartRequest creationVehiclePartRequest);

    @Mapping(target = "vehicleType", ignore = true)
    @Mapping(target = "vehiclePartCategory", ignore = true)
    VehiclePartResponse toResponse(VehiclePartEntity vehiclePartEntity);

    @Mapping(target = "vehiclePartId", ignore = true)
    @Mapping(target = "vehicleType", ignore = true)
    @Mapping(target = "vehiclePartCategories", ignore = true)
    @Mapping(target = "search", ignore = true)
    @Mapping(target = "vehiclePartName",ignore = true)
    @Mapping(target = "lastRestockDate", ignore = true)
    void toUpdate(@MappingTarget VehiclePartEntity vehiclePartEntity, UpdationVehiclePartRequest updationVehiclePartRequest);

}
