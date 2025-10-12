package com.fpt.evcare.controller;

import com.fpt.evcare.base.ApiResponse;
import com.fpt.evcare.constants.VehiclePartConstants;
import com.fpt.evcare.dto.request.vehicle_part.CreationVehiclePartRequest;
import com.fpt.evcare.dto.request.vehicle_part.UpdationVehiclePartRequest;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.dto.response.VehiclePartResponse;
import com.fpt.evcare.service.VehiclePartService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Nullable;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@AllArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping(VehiclePartConstants.BASE_URL)
public class VehiclePartController {

    VehiclePartService vehiclePartService;

    @Operation(summary = "Lấy thông tin phụ tùng theo ID")
    @GetMapping(VehiclePartConstants.VEHICLE_PART)
    public ResponseEntity<ApiResponse<VehiclePartResponse>> getVehiclePart(@PathVariable UUID id) {
        VehiclePartResponse response = vehiclePartService.getVehiclePart(id);

        log.info(VehiclePartConstants.LOG_SUCCESS_SHOWING_VEHICLE_PART, id);
        return ResponseEntity.ok(ApiResponse.<VehiclePartResponse>builder()
                .success(true)
                .message(VehiclePartConstants.MESSAGE_SUCCESS_SHOWING_VEHICLE_PART)
                .data(response)
                .build()
        );
    }

    @Operation(summary = "Tìm kiếm phụ tùng")
    @GetMapping(VehiclePartConstants.VEHICLE_PART_LIST)
    public ResponseEntity<ApiResponse<PageResponse<VehiclePartResponse>>> searchVehiclePart(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "pageSize", defaultValue = "10") int pageSize,
            @Nullable @RequestParam(name = "keyword") String keyword) {

        Pageable pageable = PageRequest.of(page, pageSize);
        PageResponse<VehiclePartResponse> response = vehiclePartService.searchVehiclePart(keyword, pageable);

        log.info(VehiclePartConstants.LOG_SUCCESS_SHOWING_VEHICLE_PART_LIST, keyword);
        return ResponseEntity.ok(ApiResponse.<PageResponse<VehiclePartResponse>>builder()
                .success(true)
                .message(VehiclePartConstants.MESSAGE_SUCCESS_SHOWING_VEHICLE_PART_LIST)
                .data(response)
                .build()
        );
    }

    @Operation(summary = "Tạo mới phụ tùng")
    @PostMapping(VehiclePartConstants.VEHICLE_PART_CREATION)
    public ResponseEntity<ApiResponse<String>> createVehiclePart(@Valid @RequestBody CreationVehiclePartRequest request) {
        boolean result = vehiclePartService.addVehiclePart(request);

        log.info(VehiclePartConstants.LOG_SUCCESS_CREATING_VEHICLE_PART, request);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(result)
                .message(VehiclePartConstants.MESSAGE_SUCCESS_CREATING_VEHICLE_PART)
                .build()
        );
    }

    @Operation(summary = "Cập nhật phụ tùng")
    @PatchMapping(VehiclePartConstants.VEHICLE_PART_UPDATE)
    public ResponseEntity<ApiResponse<String>> updateVehiclePart(@PathVariable UUID id, @Valid @RequestBody UpdationVehiclePartRequest request) {
        boolean result = vehiclePartService.updateVehiclePart(id, request);

        log.info(VehiclePartConstants.LOG_SUCCESS_UPDATING_VEHICLE_PART, id);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(result)
                .message(VehiclePartConstants.MESSAGE_SUCCESS_UPDATING_VEHICLE_PART)
                .build()
        );
    }

    @Operation(summary = "Xóa phụ tùng")
    @DeleteMapping(VehiclePartConstants.VEHICLE_PART_DELETE)
    public ResponseEntity<ApiResponse<String>> deleteVehiclePart(@PathVariable UUID id) {
        boolean result = vehiclePartService.deleteVehiclePart(id);

        log.info(VehiclePartConstants.LOG_SUCCESS_DELETING_VEHICLE_PART, id);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(result)
                .message(VehiclePartConstants.MESSAGE_SUCCESS_DELETING_VEHICLE_PART)
                .build()
        );
    }

    @Operation(summary = "Khôi phục phụ tùng đã xóa")
    @PatchMapping(VehiclePartConstants.VEHICLE_PART_RESTORE)
    public ResponseEntity<ApiResponse<String>> restoreVehiclePart(@PathVariable UUID id) {
        boolean result = vehiclePartService.restoreVehiclePart(id);

        log.info(VehiclePartConstants.LOG_SUCCESS_RESTORING_VEHICLE_PART, id);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(result)
                .message(VehiclePartConstants.MESSAGE_SUCCESS_RESTORING_VEHICLE_PART)
                .build()
        );
    }
}
