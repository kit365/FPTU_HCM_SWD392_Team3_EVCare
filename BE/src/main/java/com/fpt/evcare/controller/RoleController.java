package com.fpt.evcare.controller;

import com.fpt.evcare.base.ApiResponse;
import com.fpt.evcare.constants.RoleConstants;
import com.fpt.evcare.dto.request.RoleRequest;
import com.fpt.evcare.dto.response.RoleResponse;
import com.fpt.evcare.service.RoleService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping(RoleConstants.BASE_URL)
@AllArgsConstructor
public class RoleController {
    RoleService roleService;

    @PostMapping(RoleConstants.CREATE_ROLE)
    public ResponseEntity<ApiResponse<Void>> createRole(@RequestBody RoleRequest roleRequest) {
        roleService.createRole(roleRequest);
        return ResponseEntity
                .ok(ApiResponse.<Void>builder()
                        .success(true)
                        .message(RoleConstants.SUCCESS_CREATE_ROLE)
                        .build()
                );
    }

    @GetMapping(RoleConstants.GET_ALL_ROLE)
    public ResponseEntity<ApiResponse<List<RoleResponse>>> getAllRole() {
        List<RoleResponse> roleResponses = roleService.getAllRoles();
        return ResponseEntity
                .ok(ApiResponse.<List<RoleResponse>>builder()
                        .success(true)
                        .message(RoleConstants.SUCCESS_GET_ALL_ROLE)
                        .data(roleResponses)
                        .build()
                );
    }

    @GetMapping(RoleConstants.GET_ROLE_BY_ID)
    public ResponseEntity<ApiResponse<RoleResponse>> getRoleById(@PathVariable UUID roleId) {
        RoleResponse roleResponse = roleService.getRoleByIdResponse(roleId);
        return ResponseEntity
                .ok(ApiResponse.<RoleResponse>builder()
                        .success(true)
                        .message(RoleConstants.SUCCESS_GET_ROLE_BY_ID)
                        .data(roleResponse)
                        .build()
                );
    }

    @PutMapping(RoleConstants.UPDATE_ROLE)
    public ResponseEntity<ApiResponse<Void>> updateRole(@PathVariable UUID roleId, @RequestBody RoleRequest roleRequest) {
        roleService.updateRole(roleId, roleRequest);
        return ResponseEntity
                .ok(ApiResponse.<Void>builder()
                        .success(true)
                        .message(RoleConstants.SUCCESS_UPDATE_ROLE)
                        .build()
                );
    }
    @DeleteMapping(RoleConstants.DELETE_ROLE)
    public ResponseEntity<ApiResponse<Void>> deleteRole(@PathVariable UUID roleId) {
        roleService.deleteRole(roleId);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message(RoleConstants.MESSAGE_SUCCESS_ROLE_DELETED)
                .build()
        );
    }
}
