package com.fpt.evcare.controller;

import com.fpt.evcare.base.ApiResponse;
import com.fpt.evcare.constants.WarrantyPartConstants;
import com.fpt.evcare.dto.request.warranty_part.CreationWarrantyPartRequest;
import com.fpt.evcare.dto.request.warranty_part.UpdationWarrantyPartRequest;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.dto.response.WarrantyPartResponse;
import com.fpt.evcare.service.WarrantyPartService;
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

import java.util.UUID;

@RestController
@AllArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping(WarrantyPartConstants.BASE_URL)
public class WarrantyPartController {

    WarrantyPartService warrantyPartService;

    @Operation(summary = "Lấy thông tin bảo hành phụ tùng theo ID", description = "🔧 **Roles:** ADMIN, STAFF, TECHNICIAN")
    @GetMapping(WarrantyPartConstants.WARRANTY_PART)
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'TECHNICIAN')")
    public ResponseEntity<ApiResponse<WarrantyPartResponse>> getWarrantyPart(@PathVariable UUID id) {
        WarrantyPartResponse response = warrantyPartService.getWarrantyPart(id);

        log.info(WarrantyPartConstants.LOG_SUCCESS_SHOWING_WARRANTY_PART, id);
        return ResponseEntity.ok(ApiResponse.<WarrantyPartResponse>builder()
                .success(true)
                .message(WarrantyPartConstants.MESSAGE_SUCCESS_SHOWING_WARRANTY_PART)
                .data(response)
                .build()
        );
    }

    @Operation(
        summary = "Tìm kiếm bảo hành phụ tùng",
        description = """
            🔧 **Roles:** ADMIN, STAFF, TECHNICIAN
            
            Tìm kiếm bảo hành phụ tùng với từ khóa. Tất cả parameters đều optional.
            
            Parameters:
            - keyword: Từ khóa tìm kiếm (tên phụ tùng, loại giảm giá, ...)
            - page: Số trang (default: 0)
            - pageSize: Số lượng mỗi trang (default: 10)
            """
    )
    @GetMapping(WarrantyPartConstants.WARRANTY_PART_LIST)
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'TECHNICIAN')")
    public ResponseEntity<ApiResponse<PageResponse<WarrantyPartResponse>>> searchWarrantyPart(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "pageSize", defaultValue = "10") int pageSize,
            @Nullable @RequestParam(name = "keyword") String keyword) {

        Pageable pageable = PageRequest.of(page, pageSize);
        PageResponse<WarrantyPartResponse> response = warrantyPartService.searchWarrantyPart(keyword, pageable);

        log.info(WarrantyPartConstants.LOG_SUCCESS_SHOWING_WARRANTY_PART_LIST);
        return ResponseEntity.ok(ApiResponse.<PageResponse<WarrantyPartResponse>>builder()
                .success(true)
                .message(WarrantyPartConstants.MESSAGE_SUCCESS_SHOWING_WARRANTY_PART_LIST)
                .data(response)
                .build()
        );
    }

    @Operation(
        summary = "Lấy danh sách bảo hành phụ tùng theo Vehicle Part ID",
        description = """
            🔧 **Roles:** ADMIN, STAFF, TECHNICIAN
            
            Lấy danh sách bảo hành phụ tùng theo ID của phụ tùng.
            
            Parameters:
            - vehicle_part_id: ID của phụ tùng (UUID)
            - page: Số trang (default: 0)
            - pageSize: Số lượng mỗi trang (default: 10)
            """
    )
    @GetMapping(WarrantyPartConstants.WARRANTY_PART_LIST_BY_VEHICLE_PART_ID)
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'TECHNICIAN')")
    public ResponseEntity<ApiResponse<PageResponse<WarrantyPartResponse>>> getWarrantyPartsByVehiclePartId(
            @PathVariable(name = "vehicle_part_id") UUID vehiclePartId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "pageSize", defaultValue = "10") int pageSize) {

        Pageable pageable = PageRequest.of(page, pageSize);
        PageResponse<WarrantyPartResponse> response = warrantyPartService.getWarrantyPartsByVehiclePartId(vehiclePartId, pageable);

        log.info("Lấy danh sách bảo hành phụ tùng theo vehiclePartId thành công: {}", vehiclePartId);
        return ResponseEntity.ok(ApiResponse.<PageResponse<WarrantyPartResponse>>builder()
                .success(true)
                .message("Lấy danh sách bảo hành phụ tùng theo vehicle part ID thành công")
                .data(response)
                .build()
        );
    }

    @Operation(summary = "Tạo mới bảo hành phụ tùng", description = "🔧 **Roles:** ADMIN, STAFF")
    @PostMapping(WarrantyPartConstants.WARRANTY_PART_CREATION)
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<String>> createWarrantyPart(@Valid @RequestBody CreationWarrantyPartRequest request) {
        boolean result = warrantyPartService.createWarrantyPart(request);

        log.info(WarrantyPartConstants.LOG_SUCCESS_CREATING_WARRANTY_PART, request);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(result)
                .message(WarrantyPartConstants.MESSAGE_SUCCESS_CREATING_WARRANTY_PART)
                .build()
        );
    }

    @Operation(summary = "Cập nhật bảo hành phụ tùng", description = "🔧 **Roles:** ADMIN, STAFF")
    @PatchMapping(WarrantyPartConstants.WARRANTY_PART_UPDATE)
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<String>> updateWarrantyPart(@PathVariable UUID id, @Valid @RequestBody UpdationWarrantyPartRequest request) {
        boolean result = warrantyPartService.updateWarrantyPart(id, request);

        log.info(WarrantyPartConstants.LOG_SUCCESS_UPDATING_WARRANTY_PART, id);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(result)
                .message(WarrantyPartConstants.MESSAGE_SUCCESS_UPDATING_WARRANTY_PART)
                .build()
        );
    }

    @Operation(summary = "Xóa bảo hành phụ tùng", description = "🔧 **Roles:** ADMIN, STAFF")
    @DeleteMapping(WarrantyPartConstants.WARRANTY_PART_DELETE)
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<String>> deleteWarrantyPart(@PathVariable UUID id) {
        boolean result = warrantyPartService.deleteWarrantyPart(id);

        log.info(WarrantyPartConstants.LOG_SUCCESS_DELETING_WARRANTY_PART, id);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(result)
                .message(WarrantyPartConstants.MESSAGE_SUCCESS_DELETING_WARRANTY_PART)
                .build()
        );
    }

    @Operation(summary = "Khôi phục bảo hành phụ tùng đã xóa", description = "🔧 **Roles:** ADMIN, STAFF")
    @PatchMapping(WarrantyPartConstants.WARRANTY_PART_RESTORE)
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<String>> restoreWarrantyPart(@PathVariable UUID id) {
        boolean result = warrantyPartService.restoreWarrantyPart(id);

        log.info(WarrantyPartConstants.LOG_SUCCESS_RESTORING_WARRANTY_PART, id);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(result)
                .message(WarrantyPartConstants.MESSAGE_SUCCESS_RESTORING_WARRANTY_PART)
                .build()
        );
    }
}
