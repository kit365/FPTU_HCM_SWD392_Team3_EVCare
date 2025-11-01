package com.fpt.evcare.controller;

import com.fpt.evcare.base.ApiResponse;
import com.fpt.evcare.constants.VehicleTypeConstants;
import com.fpt.evcare.dto.request.vehicle_type.CreationVehicleTypeRequest;
import com.fpt.evcare.dto.request.vehicle_type.UpdationVehicleTypeRequest;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.dto.response.VehicleTypeResponse;
import com.fpt.evcare.service.VehicleTypeService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Nullable;
import jakarta.validation.Valid;
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
@AllArgsConstructor
@Slf4j
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping(VehicleTypeConstants.BASE_URL)
public class VehicleTypeController {

    VehicleTypeService vehicleTypeService;

    @Operation(summary = "Lấy danh sách tên loại xe", description = "🔓 **Public** - Sử dụng để làm dropdown lấy loại xe")
    @GetMapping(VehicleTypeConstants.VEHICLE_TYPE_NAME_LIST)
    public ResponseEntity<ApiResponse<List<VehicleTypeResponse>>> getVehicleTypeNameList() {
        List<VehicleTypeResponse> vehicleTypeResponses = vehicleTypeService.getVehicleTypeNameList();

        return ResponseEntity.ok(ApiResponse.<List<VehicleTypeResponse>>builder()
                .success(true)
                .message(VehicleTypeConstants.MESSAGE_SUCCESS_SHOWING_VEHICLE_TYPE_NAME_LIST)
                .data(vehicleTypeResponses)
                .build()
        );
    }

    @Operation(summary = "Lấy danh sách tên loại xe cho danh sách dịch vụ", description = "🔓 **Public** - Sử dụng để dropdown cho danh sách dịch vụ")
    @GetMapping(VehicleTypeConstants.VEHICLE_TYPE_NAME_LIST_FOR_SERVICE_TYPE)
    public ResponseEntity<ApiResponse<List<VehicleTypeResponse>>> getVehicleTypeNameListForServiceType() {
        List<VehicleTypeResponse> vehicleTypeResponses = vehicleTypeService.getVehicleTypeNameListForServiceType();

        return ResponseEntity.ok(ApiResponse.<List<VehicleTypeResponse>>builder()
                .success(true)
                .message(VehicleTypeConstants.MESSAGE_SUCCESS_SHOWING_VEHICLE_TYPE_NAME_FOR_SERVICE_TYPE_LIST)
                .data(vehicleTypeResponses)
                .build()
        );
    }

    @Operation(summary = "Lấy thông tin loại xe theo ID", description = "🔓 **Public**")
    @GetMapping(VehicleTypeConstants.VEHICLE_TYPE)
    public ResponseEntity<ApiResponse<VehicleTypeResponse>> getVehicleType(@PathVariable UUID id) {
        VehicleTypeResponse response = vehicleTypeService.getVehicleTypeById(id);

        return ResponseEntity.ok(ApiResponse.<VehicleTypeResponse>builder()
                .success(true)
                .message(VehicleTypeConstants.MESSAGE_SUCCESS_SHOWING_VEHICLE_TYPE)
                .data(response)
                .build()
        );
    }

    @Operation(summary = "Tìm kiếm loại xe", description = "🔓 **Public**")
    @GetMapping(VehicleTypeConstants.VEHICLE_TYPE_LIST)
    public ResponseEntity<ApiResponse<PageResponse<VehicleTypeResponse>>> searchVehicleType(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "pageSize", defaultValue = "10") int pageSize,
            @Nullable @RequestParam(name = "keyword") String keyword) {

        Pageable pageable = PageRequest.of(page, pageSize);
        PageResponse<VehicleTypeResponse> response = vehicleTypeService.searchVehicleTypes(keyword, pageable);

        return ResponseEntity.ok(ApiResponse.<PageResponse<VehicleTypeResponse>>builder()
                .success(true)
                .message(VehicleTypeConstants.MESSAGE_SUCCESS_SHOWING_VEHICLE_TYPE)
                .data(response)
                .build()
        );
    }

    @Operation(summary = "Tạo mới loại xe", description = "👑 **Roles:** ADMIN only")
    @PostMapping(VehicleTypeConstants.VEHICLE_TYPE_CREATION)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> createVehicleType(@Valid @RequestBody CreationVehicleTypeRequest request) {

        boolean result = vehicleTypeService.addVehicleType(request);

        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(result)
                .message(VehicleTypeConstants.MESSAGE_SUCCESS_CREATING_VEHICLE_TYPE)
                .build()
        );
    }

    @Operation(summary = "Cập nhật loại xe", description = "👑 **Roles:** ADMIN only")
    @PatchMapping(VehicleTypeConstants.VEHICLE_TYPE_UPDATE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> updateVehicleType(@PathVariable UUID id, @Valid @RequestBody UpdationVehicleTypeRequest request) {

        boolean result = vehicleTypeService.updateVehicleType(id, request);

        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(result)
                .message(VehicleTypeConstants.MESSAGE_SUCCESS_UPDATING_VEHICLE_TYPE)
                .build()
        );
    }

    @Operation(summary = "Xóa loại xe", description = "👑 **Roles:** ADMIN only")
    @DeleteMapping(VehicleTypeConstants.VEHICLE_TYPE_DELETE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteVehicleType(@PathVariable UUID id) {
        boolean result = vehicleTypeService.deleteVehicleType(id);

        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(result)
                .message(VehicleTypeConstants.MESSAGE_SUCCESS_DELETING_VEHICLE_TYPE)
                .build()
        );
    }

    @Operation(summary = "Khôi phục loại xe đã xóa", description = "👑 **Roles:** ADMIN only")
    @PatchMapping(VehicleTypeConstants.VEHICLE_TYPE_RESTORE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> restoreVehicleType(@PathVariable UUID id) {
        boolean result = vehicleTypeService.restoreVehicleType(id);

        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(result)
                .message(VehicleTypeConstants.MESSAGE_SUCCESS_RESTORING_VEHICLE_TYPE)
                .build()
        );
    }
}
