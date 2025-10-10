package com.fpt.evcare.mapper;

import com.fpt.evcare.dto.request.service_type_vehicle_part.CreationServiceTypeVehiclePartRequest;
import com.fpt.evcare.dto.request.service_type_vehicle_part.UpdationServiceTypeVehiclePartRequest;
import com.fpt.evcare.dto.response.ServiceTypeVehiclePartResponse;
import com.fpt.evcare.entity.ServiceTypeVehiclePartEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ServiceTypeVehiclePartMapper {

    @Mapping(target = "serviceTypeVehiclePartId", ignore = true)
    @Mapping(target = "serviceType", ignore = true)
    @Mapping(target = "vehiclePart", ignore = true)
    ServiceTypeVehiclePartEntity toEntity(CreationServiceTypeVehiclePartRequest creationServiceTypeVehiclePartRequest);

    @Mapping(target = "serviceType", ignore = true)
    @Mapping(target = "vehiclePart", ignore = true)
    ServiceTypeVehiclePartResponse toResponse(ServiceTypeVehiclePartEntity serviceTypeVehiclePartEntity);

    @Mapping(target = "serviceTypeVehiclePartId", ignore = true)
    @Mapping(target = "serviceType", ignore = true)
    @Mapping(target = "vehiclePart", ignore = true)
    void toUpdate(@MappingTarget ServiceTypeVehiclePartEntity serviceTypeVehiclePartEntity, UpdationServiceTypeVehiclePartRequest updationServiceTypeVehiclePartRequest);
}
