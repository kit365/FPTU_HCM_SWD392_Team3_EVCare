package com.fpt.evcare.mapper;

import com.fpt.evcare.dto.request.RoleRequest;
import com.fpt.evcare.dto.response.RoleResponse;
import com.fpt.evcare.entity.RoleEntity;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    @Mapping(target = "roleId", ignore = true)
    @Mapping(target = "permissions", expression = "java(role.getPermissions() != null ? role.getPermissions() : new ArrayList<>())")
    RoleEntity toEntity(RoleRequest role);

    // Map entity sang response
    RoleResponse toResponse(RoleEntity role);

    List<RoleResponse> toResponseList(List<RoleEntity> roleEntities);

    // Update Role (bỏ qua null và permissions)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "roleId", ignore = true)
    @Mapping(target = "isDeleted", source = "isDeleted")
    void updateRole(@MappingTarget RoleEntity entity, RoleRequest role);
}

