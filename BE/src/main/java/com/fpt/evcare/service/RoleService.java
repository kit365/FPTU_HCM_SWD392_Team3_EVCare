package com.fpt.evcare.service;

import com.fpt.evcare.dto.request.RoleRequest;
import com.fpt.evcare.dto.response.RoleResponse;
import com.fpt.evcare.entity.RoleEntity;

import java.util.List;
import java.util.UUID;

public interface RoleService {
    void createRole(RoleRequest roleRequest);

    void updateRole(UUID id, RoleRequest roleRequest);

    RoleResponse getRoleByIdResponse(UUID roleId);

    List<RoleResponse> getAllRoles();

    void deleteRole(UUID roleId);

    RoleEntity getRoleEntity(UUID roleId);
}
