package com.fpt.evcare.mapper;

import com.fpt.evcare.dto.request.service_type.CreationServiceTypeRequest;
import com.fpt.evcare.dto.request.service_type.UpdationServiceTypeRequest;
import com.fpt.evcare.dto.response.ServiceTypeResponse;
import com.fpt.evcare.entity.ServiceTypeEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ServiceTypeMapper {

    @Mapping(target = "serviceTypeId", ignore = true)
    @Mapping(target = "search", ignore = true)
    @Mapping(target = "parentId", ignore = true)
    @Mapping(target = "parent", ignore = true)
    @Mapping(target = "vehicleTypeEntity", ignore = true)
    ServiceTypeEntity toEntity (CreationServiceTypeRequest serviceTypeEntity);

    @Mapping(target = "children", ignore = true) // Ignore children to avoid recursion
    @Mapping(target = "serviceTypeVehiclePartResponses", ignore = true) // Ignore children to avoid recursion
    @Mapping(target = "vehicleTypeResponse", ignore = true)
    ServiceTypeResponse toResponse (ServiceTypeEntity serviceTypeEntity);

    @Mapping(target = "serviceTypeId", ignore = true)
    @Mapping(target = "serviceName", ignore = true)
    @Mapping(target = "search", ignore = true)
    @Mapping(target = "parentId", ignore = true)
    @Mapping(target = "parent", ignore = true)
    @Mapping(target = "vehicleTypeEntity", ignore = true)
    void updateServiceType(UpdationServiceTypeRequest updationServiceTypeRequest, @MappingTarget ServiceTypeEntity serviceTypeEntity);
}
