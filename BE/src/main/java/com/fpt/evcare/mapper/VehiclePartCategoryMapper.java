package com.fpt.evcare.mapper;

import com.fpt.evcare.dto.request.vehicle_part_category.CreationVehiclePartCategoryRequest;
import com.fpt.evcare.dto.request.vehicle_part_category.UpdationVehiclePartCategoryRequest;
import com.fpt.evcare.dto.response.VehiclePartCategoryResponse;
import com.fpt.evcare.entity.VehiclePartCategoryEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface VehiclePartCategoryMapper {

    @Mapping(target = "vehiclePartCategoryId", ignore = true)
    @Mapping(target = "search", ignore = true)
    VehiclePartCategoryEntity toEntity(CreationVehiclePartCategoryRequest creationVehiclePartCategoryRequest);

    VehiclePartCategoryResponse toResponse(VehiclePartCategoryEntity vehiclePartCategoryEntity);

    List<VehiclePartCategoryResponse> toResponseList(List<VehiclePartCategoryEntity> vehiclePartCategoryEntities);

    @Mapping(target = "vehiclePartCategoryId", ignore = true)
    @Mapping(target = "partCategoryName",  ignore = true)
    @Mapping(target = "search", ignore = true)
    void toUpdate(UpdationVehiclePartCategoryRequest updationVehiclePartCategoryRequest, @MappingTarget VehiclePartCategoryEntity vehiclePartCategoryEntity);
}
