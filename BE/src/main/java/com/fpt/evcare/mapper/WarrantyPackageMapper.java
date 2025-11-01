package com.fpt.evcare.mapper;

import com.fpt.evcare.dto.request.warranty_package.CreationWarrantyPackageRequest;
import com.fpt.evcare.dto.request.warranty_package.UpdationWarrantyPackageRequest;
import com.fpt.evcare.dto.response.WarrantyPackageResponse;
import com.fpt.evcare.entity.WarrantyPackageEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface WarrantyPackageMapper {
    
    @Mapping(target = "warrantyPackageId", ignore = true)
    @Mapping(target = "search", ignore = true)
    @Mapping(target = "warrantyPackageParts", ignore = true)
    WarrantyPackageEntity toEntity(CreationWarrantyPackageRequest request);
    
    @Mapping(target = "warrantyPackageParts", ignore = true)
    WarrantyPackageResponse toResponse(WarrantyPackageEntity entity);
    
    @Mapping(target = "warrantyPackageId", ignore = true)
    @Mapping(target = "search", ignore = true)
    @Mapping(target = "warrantyPackageParts", ignore = true)
    void toUpdate(@MappingTarget WarrantyPackageEntity entity, UpdationWarrantyPackageRequest request);
}

