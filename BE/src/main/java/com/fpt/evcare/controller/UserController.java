package com.fpt.evcare.controller;

import com.fpt.evcare.base.ApiResponse;
import com.fpt.evcare.constants.PaginationConstants;
import com.fpt.evcare.constants.UserConstants;
import com.fpt.evcare.dto.request.user.CreationUserRequest;
import com.fpt.evcare.dto.request.user.UpdationUserRequest;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.dto.response.TechnicianResponse;
import com.fpt.evcare.dto.response.UserResponse;
import com.fpt.evcare.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping(UserConstants.BASE_URL)
public class UserController {
    UserService userService;

    @GetMapping(UserConstants.USER)
    @Operation(summary = "Lấy thông tin user theo ID", description = "🔐 **Roles:** ADMIN, STAFF")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable UUID id) {
        UserResponse userResponse = userService.getUserById(id);

        return ResponseEntity
                .ok(ApiResponse.<UserResponse>builder()
                        .success(true)
                        .message(UserConstants.MESSAGE_SUCCESS_SHOWING_USER)
                        .data(userResponse)
                        .build()
                );
    }

    @GetMapping(UserConstants.USER_LIST)
    @Operation(summary = "Lấy danh sách tất cả users", description = "🔐 **Roles:** ADMIN, STAFF")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getAllUsers(
            @RequestParam(name = PaginationConstants.PAGE_KEY,
                    defaultValue = UserConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(name = PaginationConstants.PAGE_SIZE_KEY,
                    defaultValue = UserConstants.DEFAULT_PAGE_SIZE) int pageSize,
           @RequestParam(name = PaginationConstants.KEYWORD_KEY,
                   required = false) String keyword) {
        Pageable pageable = PageRequest.of(page, pageSize);
        PageResponse<UserResponse> userResponses = userService.searchUser(pageable, keyword);
        return ResponseEntity
                .ok(ApiResponse.<PageResponse<UserResponse>>builder()
                        .success(true)
                        .message(UserConstants.MESSAGE_SUCCESS_SHOWING_USER)
                        .data(userResponses)
                        .build()
                );
    }

    @PostMapping(UserConstants.USER_CREATION)
    @Operation(summary = "Tạo user mới", description = "🔐 **Roles:** ADMIN only")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> createUser(@Valid @RequestBody CreationUserRequest creationUserRequest) {
       boolean result = userService.createUser(creationUserRequest);

        return ResponseEntity
               .ok(ApiResponse.<String>builder()
                       .success(result)
                       .message(UserConstants.MESSAGE_SUCCESS_CREATING_USER )
                       .build()
               );
    }

    @PatchMapping(UserConstants.USER_UPDATE)
    @Operation(summary = "Cập nhật thông tin user", description = "🔐 **Roles:** ADMIN only")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> updateUser(@PathVariable UUID id,@Valid @RequestBody UpdationUserRequest updationUserRequest) {
        boolean result = userService.updateUser(updationUserRequest, id);

        return ResponseEntity
                .ok(ApiResponse.<String>builder()
                        .success(result)
                        .message(UserConstants.MESSAGE_SUCCESS_UPDATING_USER)
                        .build()
                );
    }

    @DeleteMapping(UserConstants.USER_DELETE)
    @Operation(summary = "Xóa user", description = "🔐 **Roles:** ADMIN only")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable UUID id) {
        boolean result = userService.deleteUser(id);

        return ResponseEntity
                .ok(ApiResponse.<String>builder()
                        .success(result)
                        .message(UserConstants.MESSAGE_SUCCESS_DELETING_USER)
                        .build()
                );
    }

    @PatchMapping(UserConstants.USER_RESTORE)
    @Operation(summary = "Khôi phục user đã xóa", description = "🔐 **Roles:** ADMIN only")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> restoreUser(@PathVariable UUID id) {
        boolean result = userService.restoreUser(id);

        return ResponseEntity
                .ok(ApiResponse.<String>builder()
                        .success(result)
                        .message(UserConstants.MESSAGE_SUCCESS_UPDATING_USER)
                        .build()
                );
    }

    @GetMapping(UserConstants.USER_PROFILE)
    @Operation(summary = "Lấy profile của user hiện tại", description = "🔐 **Roles:** Authenticated (All roles)")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserResponse>> getUserProfile(
            @RequestParam(value = "userInformation") String userInformation
    ) {
        UserResponse userResponse = userService.getUserByUserInformation(userInformation);

        return ResponseEntity
                .ok(ApiResponse.<UserResponse>builder()
                        .success(true)
                        .message(UserConstants.MESSAGE_SUCCESS_SHOWING_USER_PROFILE)
                        .data(userResponse)
                        .build()
                );
    }

    @GetMapping(UserConstants.USER_BY_ROLE)
    @Operation(summary = "Lấy danh sách users theo role", description = "👨‍💼 **Roles:** ADMIN, STAFF")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<java.util.List<UserResponse>>> getUsersByRole(
            @RequestParam(value = "roleName") String roleName
    ) {
        java.util.List<UserResponse> userResponses = userService.getUsersByRole(roleName);

        return ResponseEntity
                .ok(ApiResponse.<java.util.List<UserResponse>>builder()
                        .success(true)
                        .message(UserConstants.MESSAGE_SUCCESS_SHOWING_USER)
                        .data(userResponses)
                        .build()
                );
    }

    @GetMapping(UserConstants.TECHNICIANS)
    @Operation(summary = "Lấy danh sách kỹ thuật viên", description = "👨‍💼 **Roles:** ADMIN, STAFF")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<java.util.List<TechnicianResponse>>> getTechnicians() {
        java.util.List<TechnicianResponse> technicians = userService.getTechnicians();

        return ResponseEntity
                .ok(ApiResponse.<java.util.List<TechnicianResponse>>builder()
                        .success(true)
                        .message("Lấy danh sách kỹ thuật viên thành công")
                        .data(technicians)
                        .build()
                );
    }
}
