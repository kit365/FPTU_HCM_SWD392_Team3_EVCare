package com.fpt.evcare.controller;

import com.fpt.evcare.base.ApiResponse;
import com.fpt.evcare.constants.VehiclePartCategoryConstants;
import com.fpt.evcare.dto.request.vehicle_part_category.CreationVehiclePartCategoryRequest;
import com.fpt.evcare.dto.request.vehicle_part_category.UpdationVehiclePartCategoryRequest;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.dto.response.VehiclePartCategoryResponse;
import com.fpt.evcare.service.VehiclePartCategoryService;
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
@RequestMapping(VehiclePartCategoryConstants.BASE_URL)
public class VehiclePartCategoryController {
    VehiclePartCategoryService vehiclePartCategoryService;

    @Operation(summary = "Lấy thông tin danh mục phụ tùng theo ID", description = "🔧 **Roles:** ADMIN, STAFF, TECHNICIAN")
    @GetMapping(VehiclePartCategoryConstants.VEHICLE_PART_CATEGORY)
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'TECHNICIAN')")
    public ResponseEntity<ApiResponse<VehiclePartCategoryResponse>> getVehiclePartCategoryById(@PathVariable UUID id) {
        log.info(VehiclePartCategoryConstants.LOG_SUCCESS_SHOWING_VEHICLE_PART_CATEGORY, id);
        VehiclePartCategoryResponse response = vehiclePartCategoryService.getVehiclePartCategoryById(id);

        return ResponseEntity.ok(ApiResponse.<VehiclePartCategoryResponse>builder()
                .success(true)
                .message(VehiclePartCategoryConstants.MESSAGE_SUCCESS_SHOWING_VEHICLE_PART_CATEGORY)
                .data(response)
                .build()
        );
    }

    @Operation(summary = "Lấy danh sách danh mục phụ tùng", description = "🔧 **Roles:** ADMIN, STAFF, TECHNICIAN")
    @GetMapping(VehiclePartCategoryConstants.VEHICLE_PART_CATEGORY_LIST)
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'TECHNICIAN')")
    public ResponseEntity<ApiResponse<List<VehiclePartCategoryResponse>>> getVehiclePartCategoryList() {
        List<VehiclePartCategoryResponse> response = vehiclePartCategoryService.getvehiclePartCategoryResponseList();

        return ResponseEntity.ok(ApiResponse.<List<VehiclePartCategoryResponse>>builder()
                .success(true)
                .data(response)
                .build()
        );

    }

    @Operation(summary = "Tìm kiếm loại phụ tùng", description = "🔧 **Roles:** ADMIN, STAFF, TECHNICIAN")
    @GetMapping(VehiclePartCategoryConstants.VEHICLE_PART_CATEGORY_SEARCH_LIST)
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'TECHNICIAN')")
    public ResponseEntity<ApiResponse<PageResponse<VehiclePartCategoryResponse>>> searchVehiclePartCategory(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "pageSize", defaultValue = "10") int pageSize,
            @Nullable @RequestParam(name = "keyword") String keyword) {

        log.info(VehiclePartCategoryConstants.LOG_SUCCESS_SHOWING_VEHICLE_PART_CATEGORY_LIST, keyword);

        Pageable pageable = PageRequest.of(page, pageSize);
        PageResponse<VehiclePartCategoryResponse> response = vehiclePartCategoryService.seacrchVehiclePartCategory(keyword, pageable);

        return ResponseEntity.ok(ApiResponse.<PageResponse<VehiclePartCategoryResponse>>builder()
                .success(true)
                .message(VehiclePartCategoryConstants.MESSAGE_SUCCESS_SHOWING_VEHICLE_PART_CATEGORY_LIST)
                .data(response)
                .build()
        );
    }

    @Operation(summary = "Tạo mới loại phụ tùng", description = "👑 **Roles:** ADMIN only")
    @PostMapping(VehiclePartCategoryConstants.VEHICLE_PART_CATEGORY_CREATION)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> createVehiclePartCategory(@Valid @RequestBody CreationVehiclePartCategoryRequest request) {

        log.info(VehiclePartCategoryConstants.LOG_SUCCESS_CREATING_VEHICLE_PART_CATEGORY, request);
        boolean result = vehiclePartCategoryService.createVehiclePartCategory(request);

        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(result)
                .message(VehiclePartCategoryConstants.MESSAGE_SUCCESS_CREATING_VEHICLE_PART_CATEGORY)
                .build()
        );
    }

    @Operation(summary = "Cập nhật loại phụ tùng", description = "👑 **Roles:** ADMIN only")
    @PatchMapping(VehiclePartCategoryConstants.VEHICLE_PART_CATEGORY_UPDATE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> updateVehiclePartCategory(
            @PathVariable UUID id,
            @Valid @RequestBody UpdationVehiclePartCategoryRequest request) {

        log.info(VehiclePartCategoryConstants.LOG_SUCCESS_UPDATING_VEHICLE_PART_CATEGORY, id);
        boolean result = vehiclePartCategoryService.updateVehiclePartCategory(id, request);

        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(result)
                .message(VehiclePartCategoryConstants.MESSAGE_SUCCESS_UPDATING_VEHICLE_PART_CATEGORY)
                .build()
        );
    }

    @Operation(summary = "Xóa loại phụ tùng", description = "👑 **Roles:** ADMIN only")
    @DeleteMapping(VehiclePartCategoryConstants.VEHICLE_PART_CATEGORY_DELETE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteVehiclePartCategory(@PathVariable UUID id) {
        log.info(VehiclePartCategoryConstants.LOG_SUCCESS_DELETING_VEHICLE_PART_CATEGORY, id);
        boolean result = vehiclePartCategoryService.deleteVehiclePartCategory(id);

        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(result)
                .message(VehiclePartCategoryConstants.MESSAGE_SUCCESS_DELETING_VEHICLE_PART_CATEGORY)
                .build()
        );
    }

    @Operation(summary = "Khôi phục loại phụ tùng đã xóa", description = "👑 **Roles:** ADMIN only")
    @PatchMapping(VehiclePartCategoryConstants.VEHICLE_PART_CATEGORY_RESTORING)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> restoreVehiclePartCategory(@PathVariable UUID id) {
        log.info(VehiclePartCategoryConstants.LOG_SUCCESS_RESTORING_VEHICLE_PART_CATEGORY, id);
        boolean result = vehiclePartCategoryService.restoreVehiclePartCategory(id);

        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(result)
                .message(VehiclePartCategoryConstants.MESSAGE_SUCCESS_RESTORING_VEHICLE_PART_CATEGORY)
                .build()
        );
    }
}
