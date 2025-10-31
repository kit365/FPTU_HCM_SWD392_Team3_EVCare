package com.fpt.evcare.controller;

import com.fpt.evcare.base.ApiResponse;
import com.fpt.evcare.constants.VehicleConstants;
import com.fpt.evcare.dto.request.vehicle.CreationVehicleRequest;
import com.fpt.evcare.dto.request.vehicle.UpdationVehicleRequest;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.dto.response.VehicleResponse;
import com.fpt.evcare.service.VehicleService;
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

import java.util.List;
import java.util.UUID;

@RestController
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@AllArgsConstructor
@Slf4j
@RequestMapping(VehicleConstants.BASE_URL)
public class VehicleController {
    VehicleService vehicleService;

    @Operation(summary = "Tạo mới xe", description = "👤 **Roles:** ADMIN, STAFF, CUSTOMER - User có thể tạo xe của chính họ")
    @PostMapping(VehicleConstants.VEHICLE_CREATION)
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<String>> createVehicle(@RequestBody CreationVehicleRequest request) {
        VehicleResponse response = vehicleService.addVehicle(request);
        return ResponseEntity
                .ok(ApiResponse.<String>builder()
                .success(true)
                .message(VehicleConstants.MESSAGE_SUCCESS_CREATING_VEHICLE)
                .data(response.getVehicleId().toString())
                .build()
        );
    }
    @Operation(summary = "Lấy thông tin xe theo ID", description = "🔐 **Roles:** Authenticated (All roles) - Lấy thông tin chi tiết của một xe")
    @GetMapping(VehicleConstants.VEHICLE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<VehicleResponse>> getVehicleById(@PathVariable("id") String vehicleId) {
        VehicleResponse response = vehicleService.getVehicleById(java.util.UUID.fromString(vehicleId));
        return ResponseEntity
                .ok(ApiResponse.<VehicleResponse>builder()
                        .success(true)
                        .message(VehicleConstants.MESSAGE_SUCCESS_SHOWING_VEHICLE)
                        .data(response)
                        .build()
                );
    }
    @Operation(summary = "Tìm kiếm xe với bộ lọc", description = "👨‍💼 **Roles:** ADMIN, STAFF - Tìm kiếm và lọc danh sách xe trong hệ thống")
    @GetMapping(VehicleConstants.VEHICLE_LIST)
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<PageResponse<VehicleResponse>>> getVehicleList(@RequestParam(value = "keyword", required = false) String keyword,
                                                                       @RequestParam(value = "vehicleTypeId", required = false) String vehicleTypeId,
                                                                       @RequestParam(value = "page", defaultValue = "0") int page,
                                                                       @RequestParam(value = "size", defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        UUID vehicleTypeUuid = vehicleTypeId != null && !vehicleTypeId.isEmpty() ? UUID.fromString(vehicleTypeId) : null;
        PageResponse<VehicleResponse> response = vehicleService.searchVehicle(keyword, vehicleTypeUuid, pageable);
        return ResponseEntity
                .ok(ApiResponse.<PageResponse<VehicleResponse>>builder()
                        .success(true)
                        .message(VehicleConstants.MESSAGE_SUCCESS_SHOWING_VEHICLE_LIST)
                        .data(response)
                        .build()
                );
    }
    @Operation(summary = "Cập nhật xe", description = "👨‍💼 **Roles:** ADMIN, STAFF, CUSTOMER - Cập nhật thông tin xe")
    @PatchMapping(VehicleConstants.VEHICLE_UPDATE)
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<VehicleResponse>> updateVehicle(@PathVariable("id") UUID vehicleId,
                                                             @Valid @RequestBody UpdationVehicleRequest request) {
        VehicleResponse response = vehicleService.updateVehicle(vehicleId, request);
        return ResponseEntity
                .ok(ApiResponse.<VehicleResponse>builder()
                        .success(true)
                        .message(VehicleConstants.MESSAGE_SUCCESS_UPDATING_VEHICLE)
                        .data(response)
                        .build()
                );
    }
    @Operation(summary = "Xóa xe", description = "👨‍💼 **Roles:** ADMIN, STAFF, CUSTOMER - Xóa mềm thông tin xe")
    @DeleteMapping(VehicleConstants.VEHICLE_DELETE)
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<String>> deleteVehicle(@PathVariable("id") UUID vehicleId) {
        vehicleService.deleteVehicle(vehicleId);
        return ResponseEntity
                .ok(ApiResponse.<String>builder()
                        .success(true)
                        .message(VehicleConstants.MESSAGE_SUCCESS_DELETING_VEHICLE)
                        .build()
                );
    }
    @Operation(summary = "Khôi phục xe đã xóa", description = "👑 **Roles:** ADMIN only - Khôi phục xe đã bị xóa mềm")
    @PatchMapping(VehicleConstants.VEHICLE_RESTORE)
    @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<ApiResponse<String>> restoreVehicle(@PathVariable("id") UUID vehicleId) {
        vehicleService.restoreVehicle(vehicleId);
        return ResponseEntity
                .ok(ApiResponse.<String>builder()
                        .success(true)
                        .message(VehicleConstants.MESSAGE_SUCCESS_RESTORING_VEHICLE)
                        .build()
                );
    }

    @Operation(summary = "Lấy danh sách xe theo ID người dùng", description = "🔐 **Roles:** Authenticated (All roles) - Lấy tất cả xe của một người dùng")
    @GetMapping(VehicleConstants.VEHICLE_BY_USER)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<VehicleResponse>>> getVehiclesByUserId(
            @PathVariable("userId") UUID userId) {
        List<VehicleResponse> response = vehicleService.getVehiclesByUserId(userId);
        return ResponseEntity
                .ok(ApiResponse.<List<VehicleResponse>>builder()
                        .success(true)
                        .message(VehicleConstants.MESSAGE_SUCCESS_SHOWING_VEHICLE_BY_USER)
                        .data(response)
                        .build()
                );
    }


}
