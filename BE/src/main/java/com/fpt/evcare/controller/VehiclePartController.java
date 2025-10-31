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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@AllArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping(VehiclePartConstants.BASE_URL)
public class VehiclePartController {

    VehiclePartService vehiclePartService;

    @Operation(summary = "Lấy thông tin phụ tùng theo ID", description = "🔧 **Roles:** ADMIN, STAFF, TECHNICIAN")
    @GetMapping(VehiclePartConstants.VEHICLE_PART)
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'TECHNICIAN')")
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

    @Operation(summary = "Lấy ra giá trị enum của phụ tùng", description = "🔧 **Roles:** ADMIN, STAFF, TECHNICIAN")
    @GetMapping(VehiclePartConstants.VEHICLE_PART_ENUM_LIST)
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'TECHNICIAN')")
    public ResponseEntity<ApiResponse<List<String>>> getAllVehiclePartStatuses() {
        List<String> enumString = vehiclePartService.getAllVehiclePartStatuses();

        log.info(VehiclePartConstants.LOG_SUCCESS_SHOWING_VEHICLE_PART_ENUM);
        return ResponseEntity.ok(ApiResponse.<List<String>>builder()
                .success(true)
                .message(VehiclePartConstants.MESSAGE_SUCCESS_SHOWING_VEHICLE_PART_ENUM)
                .data(enumString)
                .build()
        );
    }

    @Operation(summary = "Lấy phụ tùng theo loại xe tương ứng", description = "🔧 **Roles:** ADMIN, STAFF, TECHNICIAN")
    @GetMapping(VehiclePartConstants.VEHICLE_PART_LIST_BY_VEHICLE_TYPE_ID)
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'TECHNICIAN')")
    public ResponseEntity<ApiResponse<List<VehiclePartResponse>>> getAllVehiclePartsByVehicleTypeId(@PathVariable(name = "vehicle_type_id") UUID vehicleTypeId) {

        List<VehiclePartResponse> response = vehiclePartService.getAllVehiclePartsByVehicleTypeId(vehicleTypeId);

        log.info(VehiclePartConstants.LOG_SUCCESS_SHOWING_VEHICLE_PART_LIST_BY_VEHICLE_TYPE_ID + vehicleTypeId);
        return ResponseEntity.ok(ApiResponse.<List<VehiclePartResponse>>builder()
                .success(true)
                .message(VehiclePartConstants.MESSAGE_SUCCESS_SHOWING_VEHICLE_PART_LIST_BY_VEHICLE_TYPE_ID)
                .data(response)
                .build()
        );
    }

    @Operation(
        summary = "Tìm kiếm phụ tùng với bộ lọc",
        description = """
            🔧 **Roles:** ADMIN, STAFF, TECHNICIAN
            
            Tìm kiếm phụ tùng với các bộ lọc tùy chọn. Tất cả parameters đều optional.
            
            Parameters:
            - keyword: Từ khóa tìm kiếm (tên phụ tùng)
            - vehicleTypeId: ID loại xe (format: UUID)
            - categoryId: ID danh mục phụ tùng (format: UUID)
            - status: Trạng thái (AVAILABLE, OUT_OF_STOCK, LOW_STOCK)
            - minStock: Chỉ lấy phụ tùng sắp hết hàng (currentQuantity <= minStock) - true/false
            - page: Số trang (default: 0)
            - pageSize: Số lượng mỗi trang (default: 10)
            
            Ví dụ:
            - Lọc theo category: GET /api/vehicle-part/?categoryId=xxx
            - Lọc low stock: GET /api/vehicle-part/?minStock=true
            - Lọc theo status và category: GET /api/vehicle-part/?status=AVAILABLE&categoryId=xxx
            - Lọc kết hợp: GET /api/vehicle-part/?keyword=battery&vehicleTypeId=xxx&status=LOW_STOCK
            """
    )
    @GetMapping(VehiclePartConstants.VEHICLE_PART_LIST)
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'TECHNICIAN')")
    public ResponseEntity<ApiResponse<PageResponse<VehiclePartResponse>>> searchVehiclePart(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "pageSize", defaultValue = "10") int pageSize,
            @Nullable @RequestParam(name = "keyword") String keyword,
            @Nullable @RequestParam(name = "vehicleTypeId") String vehicleTypeId,
            @Nullable @RequestParam(name = "categoryId") String categoryId,
            @Nullable @RequestParam(name = "status") String status,
            @Nullable @RequestParam(name = "minStock") Boolean minStock) {

        Pageable pageable = PageRequest.of(page, pageSize);

        // Nếu có filter thì dùng method có filter
        boolean hasFilters = vehicleTypeId != null || categoryId != null || status != null || minStock != null;

        PageResponse<VehiclePartResponse> response;
        if (hasFilters) {
            response = vehiclePartService.searchVehiclePartWithFilters(keyword, vehicleTypeId, categoryId, status, minStock, pageable);
        } else {
            response = vehiclePartService.searchVehiclePart(keyword, pageable);
        }

        log.info(VehiclePartConstants.LOG_SUCCESS_SHOWING_VEHICLE_PART_LIST);
        return ResponseEntity.ok(ApiResponse.<PageResponse<VehiclePartResponse>>builder()
                .success(true)
                .message(VehiclePartConstants.MESSAGE_SUCCESS_SHOWING_VEHICLE_PART_LIST)
                .data(response)
                .build()
        );
    }

    @Operation(summary = "Tạo mới phụ tùng", description = "👑 **Roles:** ADMIN only")
    @PostMapping(VehiclePartConstants.VEHICLE_PART_CREATION)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> createVehiclePart(@Valid @RequestBody CreationVehiclePartRequest request) {
        boolean result = vehiclePartService.addVehiclePart(request);

        log.info(VehiclePartConstants.LOG_SUCCESS_CREATING_VEHICLE_PART, request);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(result)
                .message(VehiclePartConstants.MESSAGE_SUCCESS_CREATING_VEHICLE_PART)
                .build()
        );
    }

    @Operation(summary = "Cập nhật phụ tùng", description = "👑 **Roles:** ADMIN only")
    @PatchMapping(VehiclePartConstants.VEHICLE_PART_UPDATE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> updateVehiclePart(@PathVariable UUID id, @Valid @RequestBody UpdationVehiclePartRequest request) {
        boolean result = vehiclePartService.updateVehiclePart(id, request);

        log.info(VehiclePartConstants.LOG_SUCCESS_UPDATING_VEHICLE_PART, id);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(result)
                .message(VehiclePartConstants.MESSAGE_SUCCESS_UPDATING_VEHICLE_PART)
                .build()
        );
    }

    @Operation(summary = "Xóa phụ tùng", description = "👑 **Roles:** ADMIN only")
    @DeleteMapping(VehiclePartConstants.VEHICLE_PART_DELETE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteVehiclePart(@PathVariable UUID id) {
        boolean result = vehiclePartService.deleteVehiclePart(id);

        log.info(VehiclePartConstants.LOG_SUCCESS_DELETING_VEHICLE_PART, id);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(result)
                .message(VehiclePartConstants.MESSAGE_SUCCESS_DELETING_VEHICLE_PART)
                .build()
        );
    }

    @Operation(summary = "Khôi phục phụ tùng đã xóa", description = "👑 **Roles:** ADMIN only")
    @PatchMapping(VehiclePartConstants.VEHICLE_PART_RESTORE)
    @PreAuthorize("hasRole('ADMIN')")
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
