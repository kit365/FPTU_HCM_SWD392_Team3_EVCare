package com.fpt.evcare.mapper;

import com.fpt.evcare.dto.request.warranty_package.UpdationWarrantyPackagePartRequest;
import com.fpt.evcare.dto.response.WarrantyPackagePartResponse;
import com.fpt.evcare.entity.WarrantyPackagePartEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface WarrantyPackagePartMapper {
    
    @Mapping(target = "warrantyPackagePartId", ignore = true)
    @Mapping(target = "warrantyPackage", ignore = true)
    @Mapping(target = "vehicle", ignore = true)
    @Mapping(target = "vehiclePart", ignore = true)
    @Mapping(target = "search", ignore = true)
    WarrantyPackagePartEntity toEntity(com.fpt.evcare.dto.request.warranty_package.CreationWarrantyPackagePartRequest request);
    
    @Mapping(target = "warrantyPackage", ignore = true)
    @Mapping(target = "vehicle", ignore = true)
    @Mapping(target = "vehiclePart", ignore = true)
    WarrantyPackagePartResponse toResponse(WarrantyPackagePartEntity entity);
    
    @Mapping(target = "warrantyPackagePartId", ignore = true)
    @Mapping(target = "warrantyPackage", ignore = true)
    @Mapping(target = "vehicle", ignore = true)
    @Mapping(target = "vehiclePart", ignore = true)
    @Mapping(target = "search", ignore = true)
    void toUpdate(@MappingTarget WarrantyPackagePartEntity entity, UpdationWarrantyPackagePartRequest request);
}

