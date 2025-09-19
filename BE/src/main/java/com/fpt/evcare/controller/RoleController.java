package com.fpt.evcare.controller;

import com.fpt.evcare.base.ApiResponse;
import com.fpt.evcare.constants.AuthConstants;
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

@RestController
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping(AuthConstants.BASE_URL)
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

}
