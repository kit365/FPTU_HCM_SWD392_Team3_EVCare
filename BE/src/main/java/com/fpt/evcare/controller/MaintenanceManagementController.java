package com.fpt.evcare.controller;

import com.fpt.evcare.base.ApiResponse;
import com.fpt.evcare.constants.MaintenanceManagementConstants;
import com.fpt.evcare.constants.PaginationConstants;
import com.fpt.evcare.dto.response.MaintenanceManagementResponse;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.service.MaintenanceManagementService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Nullable;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping(MaintenanceManagementConstants.BASE_URL)
public class MaintenanceManagementController {
    MaintenanceManagementService maintenanceManagementService;

    @GetMapping(MaintenanceManagementConstants.MAINTENANCE_MANAGEMENT)
    @Operation(summary = "Lấy Maintenance Management ID", description = "Lấy danh sách Maintenance Management của 1 cuộc hẹn cụ thể")
    public ResponseEntity<ApiResponse<MaintenanceManagementResponse>> getMaintenanceManagementEntityById(
            @PathVariable(name = "id") UUID id,
            @RequestParam(name = PaginationConstants.PAGE_KEY, defaultValue = "0") int page,
            @RequestParam(name = PaginationConstants.PAGE_SIZE_KEY, defaultValue = "10") int pageSize,
            @Nullable @RequestParam(name = PaginationConstants.KEYWORD_KEY) String keyword
    ) {
        Pageable pageable = PageRequest.of(page, pageSize);
        MaintenanceManagementResponse response = maintenanceManagementService.getMaintenanceManagementEntityById(keyword, pageable, id);

        log.info(MaintenanceManagementConstants.LOG_SUCCESS_SHOWING_MAINTENANCE_MANAGEMENT + id);
        return ResponseEntity.ok(
                ApiResponse.<MaintenanceManagementResponse>builder()
                        .success(true)
                        .message(MaintenanceManagementConstants.MESSAGE_SUCCESS_SHOWING_MAINTENANCE_MANAGEMENT)
                        .data(response)
                        .build()
        );
    }

    @GetMapping(MaintenanceManagementConstants.MAINTENANCE_MANAGEMENT_SEARCH_FOR_ADMIN)
    @Operation(
        summary = "Hiển thị danh sách maintenance management cho admin với bộ lọc", 
        description = """
            Hiển thị danh sách Maintenance Management cho admin với các bộ lọc tùy chọn.
            
            Parameters:
            - keyword: Từ khóa tìm kiếm - optional
            - status: Trạng thái (PENDING, IN_PROGRESS, COMPLETED, CANCELLED) - optional
            - vehicleId: ID xe - optional (format: UUID)
            - fromDate: Lọc từ ngày (format: yyyy-MM-dd) - optional
            - toDate: Lọc đến ngày (format: yyyy-MM-dd) - optional
            - page: Số trang (default: 0)
            - pageSize: Số lượng mỗi trang (default: 10)
            
            Ví dụ:
            - Lọc theo status: GET /api/maintenance-management/?status=IN_PROGRESS
            - Lọc theo date range: GET /api/maintenance-management/?fromDate=2024-01-01&toDate=2024-12-31
            - Lọc theo vehicle: GET /api/maintenance-management/?vehicleId=xxx
            - Lọc kết hợp: GET /api/maintenance-management/?status=COMPLETED&fromDate=2024-01-01&toDate=2024-12-31
            """
    )
    public ResponseEntity<ApiResponse<PageResponse<MaintenanceManagementResponse>>> searchMaintenanceManagement(
            @RequestParam(name = PaginationConstants.PAGE_KEY, defaultValue = "0") int page,
            @RequestParam(name = PaginationConstants.PAGE_SIZE_KEY, defaultValue = "10") int pageSize,
            @Nullable @RequestParam(name = PaginationConstants.KEYWORD_KEY) String keyword,
            @Nullable @RequestParam(name = "status") String status,
            @Nullable @RequestParam(name = "vehicleId") String vehicleId,
            @Nullable @RequestParam(name = "fromDate") String fromDate,
            @Nullable @RequestParam(name = "toDate") String toDate
    ) {
        Pageable pageable = PageRequest.of(page, pageSize);
        
        // Nếu có filter thì dùng method có filter
        boolean hasFilters = status != null || vehicleId != null || fromDate != null || toDate != null;
        
        PageResponse<MaintenanceManagementResponse> response;
        if (hasFilters) {
            response = maintenanceManagementService.searchMaintenanceManagementWithFilters(keyword, status, vehicleId, fromDate, toDate, pageable);
        } else {
            response = maintenanceManagementService.searchMaintenanceManagement(keyword, pageable);
        }

        log.info(MaintenanceManagementConstants.LOG_SUCCESS_SHOWING_MAINTENANCE_MANAGEMENT_LIST_FOR_ADMIN);
        return ResponseEntity.ok(
                ApiResponse.<PageResponse<MaintenanceManagementResponse>>builder()
                        .success(true)
                        .message(MaintenanceManagementConstants.MESSAGE_SUCCESS_SHOWING_MAINTENANCE_MANAGEMENT_LIST)
                        .data(response)
                        .build()
        );
    }

    @GetMapping(MaintenanceManagementConstants.MAINTENANCE_MANAGEMENT_SEARCH_FOR_TECHNICIAN)
    @Operation(summary = "Hiển thị danh sách maintenance management cho kỹ thuật viên", description = "Hiển thị danh sách Maintenance Management cho kỹ thuật viên có phân trang và tìm kiếm theo keyword")
    public ResponseEntity<ApiResponse<PageResponse<MaintenanceManagementResponse>>> searchMaintenanceManagementForTechnician(
            @PathVariable(name = "technician_id") UUID technicianId,
            @RequestParam(name = PaginationConstants.PAGE_KEY, defaultValue = "0") int page,
            @RequestParam(name = PaginationConstants.PAGE_SIZE_KEY, defaultValue = "10") int pageSize,
            @Nullable @RequestParam(name = PaginationConstants.KEYWORD_KEY) String keyword
    ) {
        Pageable pageable = PageRequest.of(page, pageSize);
        PageResponse<MaintenanceManagementResponse> response = maintenanceManagementService.searchMaintenanceManagementForTechnicians(technicianId, keyword, pageable);

        log.info(MaintenanceManagementConstants.LOG_SUCCESS_SHOWING_MAINTENANCE_MANAGEMENT_LIST_FOR_ADMIN);
        return ResponseEntity.ok(
                ApiResponse.<PageResponse<MaintenanceManagementResponse>>builder()
                        .success(true)
                        .message(MaintenanceManagementConstants.MESSAGE_SUCCESS_SHOWING_MAINTENANCE_MANAGEMENT_LIST)
                        .data(response)
                        .build()
        );
    }

    @GetMapping(MaintenanceManagementConstants.MAINTENANCE_MANAGEMENT_STATUS_LIST)
    @Operation(summary = "Hiển thị danh sách trạng thái maintenance management" , description = "Hiển thị danh sách trạng thái maintenance management")
    public ResponseEntity<ApiResponse<List<String>>> getMaintenanceManagementStatus(
    ) {
        List<String> response = maintenanceManagementService.getMaintenanceManagementStatuses();

        log.info(MaintenanceManagementConstants.LOG_SUCCESS_SHOWING_MAINTENANCE_MANAGEMENT_STATUS_LIST);
        return ResponseEntity.ok(
                ApiResponse.<List<String>>builder()
                        .success(true)
                        .message(MaintenanceManagementConstants.MESSAGE_SUCCESS_SHOWING_MAINTENANCE_MANAGEMENT_STATUS_LIST)
                        .data(response)
                        .build()
        );
    }
    @PatchMapping(MaintenanceManagementConstants.MAINTENANCE_MANAGEMENT_UPDATE_NOTES)
    @Operation(summary = "Cập nhật ghi chú maintenance management" , description = "Cập nhật ghi chú maintenance management")
    public ResponseEntity<ApiResponse<List<String>>> updateNotesMaintenanceManagement( @PathVariable("id") UUID id, @RequestBody String notes) {
        boolean result = maintenanceManagementService.updateNotesMaintenanceManagement(id, notes);

        log.info(MaintenanceManagementConstants.LOG_SUCCESS_UPDATING_MAINTENANCE_MANAGEMENT_NOTES);
        return ResponseEntity.ok(
                ApiResponse.<List<String>>builder()
                        .success(result)
                        .message(MaintenanceManagementConstants.MESSAGE_SUCCESS_UPDATING_MAINTENANCE_MANAGEMENT_NOTES)
                        .build()
        );
    }

    @PatchMapping(MaintenanceManagementConstants.MAINTENANCE_MANAGEMENT_STATUS)
    @Operation(summary = "Cập nhật trạng thái maintenance management" , description = "Cập nhật trạng thái maintenance management")
    public ResponseEntity<ApiResponse<List<String>>> updateStatusMaintenanceManagement( @PathVariable("id") UUID id, @RequestBody String status) {
        boolean result = maintenanceManagementService.updateMaintenanceManagementStatus(id, status);

        log.info(MaintenanceManagementConstants.LOG_SUCCESS_UPDATING_MAINTENANCE_MANAGEMENT_STATUS);
        return ResponseEntity.ok(
                ApiResponse.<List<String>>builder()
                        .success(result)
                        .message(MaintenanceManagementConstants.MESSAGE_SUCCESS_UPDATING_MAINTENANCE_MANAGEMENT_STATUS)
                        .build()
        );
    }
}
