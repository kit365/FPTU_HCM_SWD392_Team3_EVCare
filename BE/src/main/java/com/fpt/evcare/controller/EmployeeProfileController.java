package com.fpt.evcare.controller;

import com.fpt.evcare.base.ApiResponse;
import com.fpt.evcare.constants.EmployeeProfileConstants;
import com.fpt.evcare.dto.request.employee_profile.CreationEmployeeProfileRequest;
import com.fpt.evcare.dto.request.employee_profile.UpdationEmployeeProfileRequest;
import com.fpt.evcare.dto.response.EmployeeProfileResponse;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.service.EmployeeProfileService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@AllArgsConstructor
@Slf4j
@RequestMapping(EmployeeProfileConstants.BASE_URL)
public class EmployeeProfileController {
    
    EmployeeProfileService employeeProfileService;

    @Operation(summary = "Tìm kiếm hồ sơ nhân viên", description = "👨‍💼 **Roles:** ADMIN, STAFF - Tìm kiếm và lọc danh sách hồ sơ nhân viên")
    @GetMapping(EmployeeProfileConstants.EMPLOYEE_PROFILE_LIST)
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<PageResponse<EmployeeProfileResponse>>> searchEmployeeProfile(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        PageResponse<EmployeeProfileResponse> response = employeeProfileService.searchEmployeeProfile(keyword, pageable);
        
        return ResponseEntity
                .ok(ApiResponse.<PageResponse<EmployeeProfileResponse>>builder()
                        .success(true)
                        .message(EmployeeProfileConstants.MESSAGE_SUCCESS_SHOWING_EMPLOYEE_PROFILE_LIST)
                        .data(response)
                        .build()
                );
    }

    @Operation(summary = "Lấy thông tin hồ sơ nhân viên theo ID", description = "👨‍💼 **Roles:** ADMIN, STAFF - Lấy thông tin chi tiết của một hồ sơ nhân viên")
    @GetMapping(EmployeeProfileConstants.EMPLOYEE_PROFILE)
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<EmployeeProfileResponse>> getEmployeeProfileById(@PathVariable("id") UUID id) {
        EmployeeProfileResponse response = employeeProfileService.getEmployeeProfileById(id);
        return ResponseEntity
                .ok(ApiResponse.<EmployeeProfileResponse>builder()
                        .success(true)
                        .message(EmployeeProfileConstants.MESSAGE_SUCCESS_SHOWING_EMPLOYEE_PROFILE)
                        .data(response)
                        .build()
                );
    }

    @Operation(summary = "Lấy thông tin hồ sơ nhân viên theo User ID", description = "👨‍💼 **Roles:** ADMIN, STAFF - Lấy thông tin hồ sơ nhân viên theo ID của người dùng")
    @GetMapping(EmployeeProfileConstants.EMPLOYEE_PROFILE_BY_USER)
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<EmployeeProfileResponse>> getEmployeeProfileByUserId(@PathVariable("userId") UUID userId) {
        EmployeeProfileResponse response = employeeProfileService.getEmployeeProfileByUserId(userId);
        return ResponseEntity
                .ok(ApiResponse.<EmployeeProfileResponse>builder()
                        .success(true)
                        .message(EmployeeProfileConstants.MESSAGE_SUCCESS_SHOWING_EMPLOYEE_PROFILE)
                        .data(response)
                        .build()
                );
    }

    @Operation(summary = "Tạo mới hồ sơ nhân viên", description = "👨‍💼 **Roles:** ADMIN - Tạo hồ sơ nhân viên mới")
    @PostMapping(EmployeeProfileConstants.EMPLOYEE_PROFILE_CREATION)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> createEmployeeProfile(@Valid @RequestBody CreationEmployeeProfileRequest request) {
        employeeProfileService.addEmployeeProfile(request);
        return ResponseEntity
                .ok(ApiResponse.<String>builder()
                        .success(true)
                        .message(EmployeeProfileConstants.MESSAGE_SUCCESS_CREATING_EMPLOYEE_PROFILE)
                        .build()
                );
    }

    @Operation(summary = "Cập nhật hồ sơ nhân viên", description = "👨‍💼 **Roles:** ADMIN - Cập nhật thông tin hồ sơ nhân viên")
    @PatchMapping(EmployeeProfileConstants.EMPLOYEE_PROFILE_UPDATE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> updateEmployeeProfile(
            @PathVariable("id") UUID id,
            @Valid @RequestBody UpdationEmployeeProfileRequest request) {
        employeeProfileService.updateEmployeeProfile(id, request);
        return ResponseEntity
                .ok(ApiResponse.<String>builder()
                        .success(true)
                        .message(EmployeeProfileConstants.MESSAGE_SUCCESS_UPDATING_EMPLOYEE_PROFILE)
                        .build()
                );
    }

    @Operation(summary = "Xóa hồ sơ nhân viên", description = "👨‍💼 **Roles:** ADMIN - Xóa mềm hồ sơ nhân viên")
    @DeleteMapping(EmployeeProfileConstants.EMPLOYEE_PROFILE_DELETE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteEmployeeProfile(@PathVariable("id") UUID id) {
        employeeProfileService.deleteEmployeeProfile(id);
        return ResponseEntity
                .ok(ApiResponse.<String>builder()
                        .success(true)
                        .message(EmployeeProfileConstants.MESSAGE_SUCCESS_DELETING_EMPLOYEE_PROFILE)
                        .build()
                );
    }

    @Operation(summary = "Khôi phục hồ sơ nhân viên", description = "👨‍💼 **Roles:** ADMIN - Khôi phục hồ sơ nhân viên đã bị xóa")
    @PatchMapping(EmployeeProfileConstants.EMPLOYEE_PROFILE_RESTORE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> restoreEmployeeProfile(@PathVariable("id") UUID id) {
        employeeProfileService.restoreEmployeeProfile(id);
        return ResponseEntity
                .ok(ApiResponse.<String>builder()
                        .success(true)
                        .message(EmployeeProfileConstants.MESSAGE_SUCCESS_RESTORING_EMPLOYEE_PROFILE)
                        .build()
                );
    }
}

