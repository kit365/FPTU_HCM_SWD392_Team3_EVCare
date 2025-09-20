package com.fpt.evcare.service;

import com.fpt.evcare.dto.request.RoleRequest;
import com.fpt.evcare.dto.response.RoleResponse;

import java.util.List;
import java.util.UUID;

public interface RoleService {
    void createRole(RoleRequest roleRequest);

    void updateRole(UUID id, RoleRequest roleRequest);

    RoleResponse getRoleByIdResponse(UUID roleId);

    List<RoleResponse> getAllRoles();

    void deleteSoftRole(UUID roleId);
}
