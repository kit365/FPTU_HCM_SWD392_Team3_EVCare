package com.fpt.evcare.mapper;


import com.fpt.evcare.dto.request.vehicle_type.CreationVehicleTypeRequest;
import com.fpt.evcare.dto.request.vehicle_type.UpdationVehicleTypeRequest;
import com.fpt.evcare.dto.response.VehicleTypeResponse;
import com.fpt.evcare.entity.VehicleTypeEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface VehicleTypeMapper {

    @Mapping(target = "vehicleTypeId", ignore = true)
    @Mapping(target = "search", ignore = true)
    @Mapping(target = "vehicleParts", ignore = true)
    VehicleTypeEntity toEntity(CreationVehicleTypeRequest creationVehicleTypeRequest);

    VehicleTypeResponse toResponse(VehicleTypeEntity vehicleTypeEntity);

    @Mapping(target = "vehicleTypeId", ignore = true)
    @Mapping(target = "vehicleParts", ignore = true)
    @Mapping(target = "search", ignore = true)
    @Mapping(target = "vehicleTypeName", ignore = true)
    void toUpdate(@MappingTarget VehicleTypeEntity vehicleTypeEntity, UpdationVehicleTypeRequest updationVehicleTypeRequest);
}
