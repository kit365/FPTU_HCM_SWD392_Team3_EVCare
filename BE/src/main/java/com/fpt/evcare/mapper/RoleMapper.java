package com.fpt.evcare.mapper;

import com.fpt.evcare.dto.request.RoleRequest;
import com.fpt.evcare.dto.response.RoleResponse;
import com.fpt.evcare.entity.RoleEntity;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    // Tạo mới Role từ request (bỏ qua permissions, xử lý riêng)
    @Mapping(target = "permissions", ignore = true)
    RoleEntity toEntity(RoleRequest role);

    // Map entity sang response
    RoleResponse toResponse(RoleEntity role);

    List<RoleResponse> toResponseList(List<RoleEntity> roleEntities);

    // Update Role (bỏ qua null và permissions)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "permissions", ignore = true)
    void updateRole(@MappingTarget RoleEntity entity, RoleRequest dto);
}

