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

import java.util.UUID;

@RestController
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@AllArgsConstructor
@Slf4j
@RequestMapping(VehicleConstants.BASE_URL)
public class VehicleController {
    VehicleService vehicleService;

    @Operation(summary = "Tạo mới xe")
    @PostMapping(VehicleConstants.VEHICLE_CREATION)
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
    @Operation(summary = "Lấy thông tin xe theo ID")
    @GetMapping(VehicleConstants.VEHICLE)
    public ResponseEntity<ApiResponse<VehicleResponse>> getVehicleById(@RequestParam("vehicleId") String vehicleId) {
        VehicleResponse response = vehicleService.getVehicleById(java.util.UUID.fromString(vehicleId));
        return ResponseEntity
                .ok(ApiResponse.<VehicleResponse>builder()
                        .success(true)
                        .message(VehicleConstants.MESSAGE_SUCCESS_SHOWING_VEHICLE)
                        .data(response)
                        .build()
                );
    }
    @Operation(summary = "Tìm kiếm xe")
    @GetMapping(VehicleConstants.VEHICLE_LIST)
    public ResponseEntity<ApiResponse<PageResponse<VehicleResponse>>> getVehicleList(@RequestParam(value = "keyword", required = false) String keyword,
                                                                       @RequestParam(value = "vehicleTypeId", required = false) UUID vehicleTypeId,
                                                                       @RequestParam(value = "page", defaultValue = "0") int page,
                                                                       @RequestParam(value = "size", defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        PageResponse<VehicleResponse> response = vehicleService.searchVehicle(keyword, vehicleTypeId, pageable);
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
    @Operation(summary = "Xóa xe", description = "👨‍💼 **Roles:** ADMIN, STAFF, CUSTOMER - Xóa hồ sơ xe (soft delete)")
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
    @Operation(summary = "Khôi phục xe đã xóa", description = "👨‍💼 **Roles:** ADMIN, STAFF - Khôi phục hồ sơ xe đã xóa")
    @PatchMapping(VehicleConstants.VEHICLE_RESTORE)
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<String>> restoreVehicle(@PathVariable("id") UUID vehicleId) {
        vehicleService.restoreVehicle(vehicleId);
        return ResponseEntity
                .ok(ApiResponse.<String>builder()
                        .success(true)
                        .message(VehicleConstants.MESSAGE_SUCCESS_RESTORING_VEHICLE)
                        .build()
                );
    }

    @Operation(summary = "Lấy danh sách xe theo người dùng", description = "👨‍💼 **Roles:** ADMIN, STAFF, CUSTOMER - Lấy danh sách xe của một người dùng")
    @GetMapping(VehicleConstants.VEHICLE_BY_USER)
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<java.util.List<VehicleResponse>>> getVehiclesByUserId(@PathVariable("userId") UUID userId) {
        java.util.List<VehicleResponse> response = vehicleService.getVehiclesByUserId(userId);
        return ResponseEntity
                .ok(ApiResponse.<java.util.List<VehicleResponse>>builder()
                        .success(true)
                        .message(VehicleConstants.MESSAGE_SUCCESS_SHOWING_VEHICLE_BY_USER)
                        .data(response)
                        .build()
                );
    }

}
