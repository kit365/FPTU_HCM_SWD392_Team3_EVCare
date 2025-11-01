package com.fpt.evcare.controller;

import com.fpt.evcare.base.ApiResponse;
import com.fpt.evcare.constants.EndpointConstants;
import com.fpt.evcare.constants.ShiftConstants;
import com.fpt.evcare.dto.request.shift.AssignShiftRequest;
import com.fpt.evcare.dto.request.shift.CheckTechnicianAvailabilityRequest;
import com.fpt.evcare.dto.request.shift.CreationShiftRequest;
import com.fpt.evcare.dto.request.shift.UpdationShiftRequest;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.dto.response.ShiftResponse;
import com.fpt.evcare.dto.response.TechnicianAvailabilityResponse;
import com.fpt.evcare.dto.response.UserResponse;
import com.fpt.evcare.service.ShiftService;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping(EndpointConstants.V1.API + ShiftConstants.SHIFT_BASE_URL)
public class ShiftController {

    ShiftService shiftService;

    @GetMapping(ShiftConstants.SHIFT_GET_TYPES)
    @Operation(summary = "Lấy danh sách loại ca làm việc", description = "👨‍💼 **Roles:** ADMIN, STAFF - Hiển thị toàn bộ các giá trị của enum ShiftTypeEnum")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<String>>> getAllShiftTypes() {
        List<String> shiftTypes = shiftService.getAllShiftTypes();

        return ResponseEntity.ok(
                ApiResponse.<List<String>>builder()
                        .success(true)
                        .message(ShiftConstants.MESSAGE_SUCCESS_SHOWING_SHIFT_TYPE_LIST)
                        .data(shiftTypes)
                        .build()
        );
    }

    @GetMapping(ShiftConstants.SHIFT_GET_STATUSES)
    @Operation(summary = "Lấy danh sách trạng thái ca làm việc", description = "👨‍💼 **Roles:** ADMIN, STAFF - Hiển thị toàn bộ các giá trị của enum ShiftStatusEnum")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<String>>> getAllShiftStatuses() {
        List<String> shiftStatuses = shiftService.getAllShiftStatuses();

        return ResponseEntity.ok(
                ApiResponse.<List<String>>builder()
                        .success(true)
                        .message(ShiftConstants.MESSAGE_SUCCESS_SHOWING_SHIFT_STATUS_LIST)
                        .data(shiftStatuses)
                        .build()
        );
    }

    @GetMapping(ShiftConstants.SHIFT_GET_BY_ID)
    @Operation(summary = "Lấy thông tin ca làm việc theo ID", description = "🔧 **Roles:** ADMIN, STAFF, TECHNICIAN - Từ ID của ca làm việc, hiển thị toàn bộ thông tin của ca làm việc đó")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'TECHNICIAN')")
    public ResponseEntity<ApiResponse<ShiftResponse>> getShiftById(@PathVariable("id") UUID id) {
        ShiftResponse response = shiftService.getShiftById(id);

        return ResponseEntity.ok(
                ApiResponse.<ShiftResponse>builder()
                        .success(true)
                        .message(ShiftConstants.MESSAGE_SUCCESS_SHOWING_SHIFT_BY_ID)
                        .data(response)
                        .build()
        );
    }

    @GetMapping(ShiftConstants.SHIFT_SEARCH)
    @Operation(summary = "Tìm kiếm ca làm việc", description = "👨‍💼 **Roles:** ADMIN, STAFF - Tìm kiếm ca làm việc theo từ khóa với phân trang và filters")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<PageResponse<ShiftResponse>>> searchShift(
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "page", defaultValue = "1") int page,
            @RequestParam(name = "pageSize", defaultValue = "10") int pageSize,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "shiftType", required = false) String shiftType,
            @RequestParam(name = "fromDate", required = false) String fromDate,
            @RequestParam(name = "toDate", required = false) String toDate
    ) {
        Pageable pageable = PageRequest.of(page, pageSize);
        
        // Nếu không có filter nào thì dùng method cũ
        boolean hasFilters = status != null || shiftType != null || fromDate != null || toDate != null;
        
        PageResponse<ShiftResponse> response;
        if (hasFilters) {
            response = shiftService.searchShiftWithFilters(keyword, status, shiftType, fromDate, toDate, pageable);
        } else {
            response = shiftService.searchShift(keyword, pageable);
        }

        return ResponseEntity.ok(
                ApiResponse.<PageResponse<ShiftResponse>>builder()
                        .success(true)
                        .message(ShiftConstants.MESSAGE_SUCCESS_SHOWING_SHIFT_LIST)
                        .data(response)
                        .build()
        );
    }

    @GetMapping(ShiftConstants.SHIFT_SEARCH_FOR_TECHNICIAN)
    @Operation(
        summary = "Lấy danh sách ca làm việc của kỹ thuật viên", 
        description = "🔧 **Roles:** ADMIN, STAFF, TECHNICIAN - Hiển thị danh sách ca làm việc được phân công cho kỹ thuật viên cụ thể với phân trang và tìm kiếm theo keyword"
    )
    public ResponseEntity<ApiResponse<PageResponse<ShiftResponse>>> searchShiftForTechnician(
            @PathVariable("technician_id") UUID technicianId,
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "pageSize", defaultValue = "10") int pageSize
    ) {
        Pageable pageable = PageRequest.of(page, pageSize);
        PageResponse<ShiftResponse> response = shiftService.searchShiftForTechnician(technicianId, keyword, pageable);

        return ResponseEntity.ok(
                ApiResponse.<PageResponse<ShiftResponse>>builder()
                        .success(true)
                        .message(ShiftConstants.MESSAGE_SUCCESS_SHOWING_SHIFT_LIST)
                        .data(response)
                        .build()
        );
    }

    @GetMapping(ShiftConstants.SHIFT_GET_BY_APPOINTMENT)
    @Operation(summary = "Lấy danh sách ca làm việc theo lịch hẹn", description = "🔧 **Roles:** ADMIN, STAFF, TECHNICIAN - Từ ID của lịch hẹn, hiển thị danh sách các ca làm việc")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'TECHNICIAN')")
    public ResponseEntity<ApiResponse<PageResponse<ShiftResponse>>> getShiftsByAppointmentId(
            @PathVariable("appointmentId") UUID appointmentId,
            @RequestParam(name = "page", defaultValue = "1") int page,
            @RequestParam(name = "pageSize", defaultValue = "10") int pageSize
    ) {
        Pageable pageable = PageRequest.of(page, pageSize);
        PageResponse<ShiftResponse> response = shiftService.getShiftsByAppointmentId(appointmentId, pageable);

        return ResponseEntity.ok(
                ApiResponse.<PageResponse<ShiftResponse>>builder()
                        .success(true)
                        .message(ShiftConstants.MESSAGE_SUCCESS_SHOWING_SHIFT_LIST)
                        .data(response)
                        .build()
        );
    }

    @PostMapping(ShiftConstants.SHIFT_CREATE)
    @Operation(summary = "Tạo ca làm việc mới", description = "👨‍💼 **Roles:** ADMIN, STAFF - Tạo một ca làm việc mới trong hệ thống")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<String>> createShift(@RequestBody @Valid CreationShiftRequest creationShiftRequest) {
        boolean result = shiftService.addShift(creationShiftRequest);

        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .success(result)
                        .message(ShiftConstants.MESSAGE_SUCCESS_CREATING_SHIFT)
                        .build()
        );
    }

    @PutMapping(ShiftConstants.SHIFT_UPDATE)
    @Operation(summary = "Cập nhật ca làm việc", description = "👨‍💼 **Roles:** ADMIN, STAFF - Cập nhật thông tin ca làm việc theo ID")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<String>> updateShift(
            @PathVariable("id") UUID id,
            @RequestBody @Valid UpdationShiftRequest updationShiftRequest
    ) {
        boolean result = shiftService.updateShift(id, updationShiftRequest);

        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .success(result)
                        .message(ShiftConstants.MESSAGE_SUCCESS_UPDATING_SHIFT)
                        .build()
        );
    }

    @DeleteMapping(ShiftConstants.SHIFT_DELETE)
    @Operation(summary = "Xóa ca làm việc", description = "👑 **Roles:** ADMIN only - Xóa mềm ca làm việc theo ID")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteShift(@PathVariable("id") UUID id) {
        boolean result = shiftService.deleteShift(id);

        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .success(result)
                        .message(ShiftConstants.MESSAGE_SUCCESS_DELETING_SHIFT)
                        .build()
        );
    }

    @PutMapping(ShiftConstants.SHIFT_RESTORE)
    @Operation(summary = "Khôi phục ca làm việc", description = "👑 **Roles:** ADMIN only - Khôi phục ca làm việc đã bị xóa theo ID")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> restoreShift(@PathVariable("id") UUID id) {
        boolean result = shiftService.restoreShift(id);

        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .success(result)
                        .message(ShiftConstants.MESSAGE_SUCCESS_RESTORING_SHIFT)
                        .build()
        );
    }

    @PostMapping(ShiftConstants.SHIFT_CHECK_AVAILABILITY)
    @Operation(summary = "Kiểm tra khả dụng của kỹ thuật viên", description = "👨‍💼 **Roles:** ADMIN, STAFF - Kiểm tra xem các kỹ thuật viên có bị trùng ca làm việc không")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<TechnicianAvailabilityResponse>>> checkTechnicianAvailability(
            @Valid @RequestBody CheckTechnicianAvailabilityRequest request) {
        List<TechnicianAvailabilityResponse> results = shiftService.checkTechnicianAvailability(request);

        return ResponseEntity.ok(
                ApiResponse.<List<TechnicianAvailabilityResponse>>builder()
                        .success(true)
                        .message(ShiftConstants.MESSAGE_SUCCESS_CHECKING_AVAILABILITY)
                        .data(results)
                        .build()
        );
    }

    @GetMapping(ShiftConstants.SHIFT_GET_AVAILABLE_TECHNICIANS)
    @Operation(summary = "Lấy danh sách kỹ thuật viên available", description = "👨‍💼 **Roles:** ADMIN, STAFF - Lấy danh sách kỹ thuật viên không bị trùng ca làm việc trong khoảng thời gian")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAvailableTechnicians(
            @RequestParam String startTime,
            @RequestParam String endTime,
            @RequestParam(required = false) UUID excludeShiftId) {
        
        LocalDateTime start = LocalDateTime.parse(startTime);
        LocalDateTime end = LocalDateTime.parse(endTime);
        
        List<UserResponse> availableTechnicians = 
                shiftService.getAvailableTechnicians(start, end, excludeShiftId);

        return ResponseEntity.ok(
                ApiResponse.<List<UserResponse>>builder()
                        .success(true)
                        .message(ShiftConstants.MESSAGE_SUCCESS_GET_AVAILABLE_TECHNICIANS)
                        .data(availableTechnicians)
                        .build()
        );
    }

    @PatchMapping(ShiftConstants.SHIFT_ASSIGN)
    @Operation(summary = "Phân công ca làm việc", description = "👨‍💼 **Roles:** ADMIN, STAFF - Phân công assignee, staff và technicians cho shift đang ở trạng thái PENDING_ASSIGNMENT")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<String>> assignShift(
            @PathVariable UUID id,
            @Valid @RequestBody AssignShiftRequest request) {
        log.info(ShiftConstants.LOG_INFO_ASSIGNING_SHIFT, id);
        
        boolean result = shiftService.assignShift(id, request);
        
        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .success(result)
                        .message(ShiftConstants.MESSAGE_SUCCESS_ASSIGNING_SHIFT)
                        .build()
        );
    }
    
    @PatchMapping(ShiftConstants.SHIFT_UPDATE_STATUS)
    @Operation(summary = "Cập nhật trạng thái ca làm việc", description = "👨‍💼 **Roles:** ADMIN, STAFF - Cập nhật trạng thái ca làm việc (ví dụ: SCHEDULED → IN_PROGRESS)")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<String>> updateShiftStatus(
            @PathVariable("id") UUID id,
            @RequestBody String status) {
        shiftService.updateShiftStatus(id, status);
        
        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .success(true)
                        .message(ShiftConstants.MESSAGE_SUCCESS_UPDATING_SHIFT)
                        .build()
        );
    }
}



