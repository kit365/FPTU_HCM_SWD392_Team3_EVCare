package com.fpt.evcare.controller;

import com.fpt.evcare.base.ApiResponse;
import com.fpt.evcare.constants.ServiceTypeVehiclePartConstants;
import com.fpt.evcare.dto.request.service_type_vehicle_part.CreationServiceTypeVehiclePartRequest;
import com.fpt.evcare.dto.request.service_type_vehicle_part.UpdationServiceTypeVehiclePartRequest;
import com.fpt.evcare.dto.response.ServiceTypeVehiclePartResponse;
import com.fpt.evcare.service.ServiceTypeVehiclePartService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping(ServiceTypeVehiclePartConstants.BASE_URL)
public class ServiceTypeVehiclePartController {
    ServiceTypeVehiclePartService serviceTypeVehiclePartService;

    @GetMapping(ServiceTypeVehiclePartConstants.STVP)
    public ResponseEntity<ApiResponse<ServiceTypeVehiclePartResponse>> getServiceTypeVehiclePartById(@PathVariable(name = "id") UUID id) {
        ServiceTypeVehiclePartResponse response = serviceTypeVehiclePartService.getServiceTypeVehiclePartById(id);

        log.info(ServiceTypeVehiclePartConstants.LOG_SUCCESS_SHOWING_SERVICE_TYPE_VEHICLE_PART);
        return ResponseEntity.ok(ApiResponse.<ServiceTypeVehiclePartResponse>builder()
                .success(true)
                .message(ServiceTypeVehiclePartConstants.MESSAGE_SUCCESS_SHOWING_SERVICE_TYPE_VEHICLE_PART)
                .data(response)
                .build());
    }

    @PostMapping(ServiceTypeVehiclePartConstants.STVP_CREATION)
    public ResponseEntity<ApiResponse<String>> createServiceTypeVehiclePart(
            @Valid @RequestBody CreationServiceTypeVehiclePartRequest request) {

        boolean result = serviceTypeVehiclePartService.createServiceTypeVehiclePart(request);

        log.info(ServiceTypeVehiclePartConstants.LOG_SUCCESS_CREATING_SERVICE_TYPE_VEHICLE_PART);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(result)
                .message(ServiceTypeVehiclePartConstants.MESSAGE_SUCCESS_CREATING_SERVICE_TYPE_VEHICLE_PART)
                .build());
    }

    @PatchMapping(ServiceTypeVehiclePartConstants.STVP_UPDATE)
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

    @DeleteMapping(ServiceTypeVehiclePartConstants.STVP_DELETE)
    public ResponseEntity<ApiResponse<String>> deleteServiceTypeVehiclePart(@PathVariable UUID id) {
        boolean result = serviceTypeVehiclePartService.deleteServiceTypeVehiclePart(id);

        log.info(ServiceTypeVehiclePartConstants.LOG_SUCCESS_DELETING_SERVICE_TYPE_VEHICLE_PART);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(result)
                .message(ServiceTypeVehiclePartConstants.MESSAGE_SUCCESS_DELETING_SERVICE_TYPE_VEHICLE_PART)
                .build());
    }

    @PatchMapping(ServiceTypeVehiclePartConstants.STVP_RESTORE)
    public ResponseEntity<ApiResponse<String>> restoreServiceTypeVehiclePart(@PathVariable UUID id) {

        boolean result = serviceTypeVehiclePartService.restoreServiceTypeVehiclePart(id);

        log.info(ServiceTypeVehiclePartConstants.LOG_SUCCESS_RESTORING_SERVICE_TYPE_VEHICLE_PART);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(result)
                .message(ServiceTypeVehiclePartConstants.MESSAGE_SUCCESS_RESTORING_SERVICE_TYPE_VEHICLE_PART)
                .build());
    }
}
