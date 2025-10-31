package com.fpt.evcare.controller;

import com.fpt.evcare.base.ApiResponse;
import com.fpt.evcare.constants.ServiceTypeVehiclePartConstants;
import com.fpt.evcare.dto.request.service_type_vehicle_part.CreationServiceTypeVehiclePartRequest;
import com.fpt.evcare.dto.request.service_type_vehicle_part.UpdationServiceTypeVehiclePartRequest;
import com.fpt.evcare.dto.response.ServiceTypeVehiclePartResponse;
import com.fpt.evcare.service.ServiceTypeVehiclePartService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping(ServiceTypeVehiclePartConstants.BASE_URL)
public class ServiceTypeVehiclePartController {
    ServiceTypeVehiclePartService serviceTypeVehiclePartService;

    @Operation(summary = "Lấy thông tin dịch vụ - phụ tùng theo ID", description = "🔐 **Roles:** Authenticated (All roles)")
    @GetMapping(ServiceTypeVehiclePartConstants.STVP)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ServiceTypeVehiclePartResponse>> getServiceTypeVehiclePartById(@PathVariable(name = "id") UUID id) {
        ServiceTypeVehiclePartResponse response = serviceTypeVehiclePartService.getServiceTypeVehiclePartById(id);

        log.info(ServiceTypeVehiclePartConstants.LOG_SUCCESS_SHOWING_SERVICE_TYPE_VEHICLE_PART);
        return ResponseEntity.ok(ApiResponse.<ServiceTypeVehiclePartResponse>builder()
                .success(true)
                .message(ServiceTypeVehiclePartConstants.MESSAGE_SUCCESS_SHOWING_SERVICE_TYPE_VEHICLE_PART)
                .data(response)
                .build());
    }

    @Operation(summary = "Lấy danh sách phụ tùng theo Service Type ID", description = "🔐 **Roles:** Authenticated (All roles)")
    @GetMapping("/service-type/{serviceTypeId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<ServiceTypeVehiclePartResponse>>> getVehiclePartsByServiceTypeId(
            @PathVariable(name = "serviceTypeId") UUID serviceTypeId) {
        List<ServiceTypeVehiclePartResponse> responses = serviceTypeVehiclePartService.getVehiclePartResponseByServiceTypeId(serviceTypeId);

        log.info(ServiceTypeVehiclePartConstants.LOG_SUCCESS_RETRIEVED_VEHICLE_PARTS_BY_SERVICE_TYPE, serviceTypeId);
        return ResponseEntity.ok(ApiResponse.<List<ServiceTypeVehiclePartResponse>>builder()
                .success(true)
                .message(ServiceTypeVehiclePartConstants.MESSAGE_SUCCESS_RETRIEVED_VEHICLE_PARTS)
                .data(responses)
                .build());
    }

    @Operation(summary = "Tạo thông tin dịch vụ - phụ tùng theo dịch vụ ID", description = "👑 **Roles:** ADMIN only")
    @PostMapping(ServiceTypeVehiclePartConstants.STVP_CREATION)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> createServiceTypeVehiclePart(
            @Valid @RequestBody CreationServiceTypeVehiclePartRequest request) {

        boolean result = serviceTypeVehiclePartService.createServiceTypeVehiclePart(request);

        log.info(ServiceTypeVehiclePartConstants.LOG_SUCCESS_CREATING_SERVICE_TYPE_VEHICLE_PART);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(result)
                .message(ServiceTypeVehiclePartConstants.MESSAGE_SUCCESS_CREATING_SERVICE_TYPE_VEHICLE_PART)
                .build());
    }

    @Operation(summary = "Cập nhật dịch vụ - phụ tùng", description = "👑 **Roles:** ADMIN only")
    @PatchMapping(ServiceTypeVehiclePartConstants.STVP_UPDATE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> updateServiceTypeVehiclePart(
            @PathVariable UUID id,
            @Valid @RequestBody UpdationServiceTypeVehiclePartRequest request) {

        boolean result = serviceTypeVehiclePartService.updateServiceTypeVehiclePart(id, request);

        log.info(ServiceTypeVehiclePartConstants.LOG_SUCCESS_UPDATING_SERVICE_TYPE_VEHICLE_PART);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(result)
                .message(ServiceTypeVehiclePartConstants.MESSAGE_SUCCESS_UPDATING_SERVICE_TYPE_VEHICLE_PART)
                .build());
    }

    @Operation(summary = "Xóa thông tin dịch vụ - phụ tùng theo ID", description = "👑 **Roles:** ADMIN only")
    @DeleteMapping(ServiceTypeVehiclePartConstants.STVP_DELETE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteServiceTypeVehiclePart(@PathVariable UUID id) {
        boolean result = serviceTypeVehiclePartService.deleteServiceTypeVehiclePart(id);

        log.info(ServiceTypeVehiclePartConstants.LOG_SUCCESS_DELETING_SERVICE_TYPE_VEHICLE_PART);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(result)
                .message(ServiceTypeVehiclePartConstants.MESSAGE_SUCCESS_DELETING_SERVICE_TYPE_VEHICLE_PART)
                .build());
    }

    @Operation(summary = "Khôi phục thông tin dịch vụ - phụ tùng theo ID", description = "👑 **Roles:** ADMIN only")
    @PatchMapping(ServiceTypeVehiclePartConstants.STVP_RESTORE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> restoreServiceTypeVehiclePart(@PathVariable UUID id) {

        boolean result = serviceTypeVehiclePartService.restoreServiceTypeVehiclePart(id);

        log.info(ServiceTypeVehiclePartConstants.LOG_SUCCESS_RESTORING_SERVICE_TYPE_VEHICLE_PART);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(result)
                .message(ServiceTypeVehiclePartConstants.MESSAGE_SUCCESS_RESTORING_SERVICE_TYPE_VEHICLE_PART)
                .build());
    }
}
