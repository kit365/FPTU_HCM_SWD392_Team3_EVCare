package com.fpt.evcare.mapper;

import com.fpt.evcare.dto.request.warranty_part.CreationWarrantyPartRequest;
import com.fpt.evcare.dto.request.warranty_part.UpdationWarrantyPartRequest;
import com.fpt.evcare.dto.response.WarrantyPartResponse;
import com.fpt.evcare.entity.WarrantyPartEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface WarrantyPartMapper {

    @Mapping(target = "warrantyPartId", ignore = true)
    @Mapping(target = "vehiclePart", ignore = true)
    @Mapping(target = "search", ignore = true)
    @Mapping(target = "version", ignore = true)
    WarrantyPartEntity toEntity(CreationWarrantyPartRequest creationWarrantyPartRequest);

    @Mapping(target = "vehiclePart", ignore = true)
    WarrantyPartResponse toResponse(WarrantyPartEntity warrantyPartEntity);

    @Mapping(target = "warrantyPartId", ignore = true)
    @Mapping(target = "vehiclePart", ignore = true)
    @Mapping(target = "search", ignore = true)
    @Mapping(target = "version", ignore = true)
    void toUpdate(@MappingTarget WarrantyPartEntity warrantyPartEntity, UpdationWarrantyPartRequest updationWarrantyPartRequest);
}
