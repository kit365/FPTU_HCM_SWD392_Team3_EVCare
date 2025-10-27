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
    @Operation(summary = "Lấy danh sách loại ca làm việc", description = "Hiển thị toàn bộ các giá trị của enum ShiftTypeEnum")
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
    @Operation(summary = "Lấy danh sách trạng thái ca làm việc", description = "Hiển thị toàn bộ các giá trị của enum ShiftStatusEnum")
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
    @Operation(summary = "Lấy thông tin ca làm việc theo ID", description = "Từ ID của ca làm việc, hiển thị toàn bộ thông tin của ca làm việc đó")
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
    @Operation(summary = "Tìm kiếm ca làm việc", description = "Tìm kiếm ca làm việc theo từ khóa với phân trang")
    public ResponseEntity<ApiResponse<PageResponse<ShiftResponse>>> searchShift(
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "page", defaultValue = "1") int page,
            @RequestParam(name = "pageSize", defaultValue = "10") int pageSize
    ) {
        Pageable pageable = PageRequest.of(page, pageSize);
        PageResponse<ShiftResponse> response = shiftService.searchShift(keyword, pageable);

        return ResponseEntity.ok(
                ApiResponse.<PageResponse<ShiftResponse>>builder()
                        .success(true)
                        .message(ShiftConstants.MESSAGE_SUCCESS_SHOWING_SHIFT_LIST)
                        .data(response)
                        .build()
        );
    }

    @GetMapping(ShiftConstants.SHIFT_GET_BY_APPOINTMENT)
    @Operation(summary = "Lấy danh sách ca làm việc theo lịch hẹn", description = "Từ ID của lịch hẹn, hiển thị danh sách các ca làm việc")
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
    @Operation(summary = "Tạo ca làm việc mới", description = "Tạo một ca làm việc mới trong hệ thống")
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
    @Operation(summary = "Cập nhật ca làm việc", description = "Cập nhật thông tin ca làm việc theo ID")
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
    @Operation(summary = "Xóa ca làm việc", description = "Xóa mềm ca làm việc theo ID")
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
    @Operation(summary = "Khôi phục ca làm việc", description = "Khôi phục ca làm việc đã bị xóa theo ID")
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
    @Operation(summary = "Kiểm tra khả dụng của kỹ thuật viên", description = "Kiểm tra xem các kỹ thuật viên có bị trùng ca làm việc không")
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
    @Operation(summary = "Lấy danh sách kỹ thuật viên available", description = "Lấy danh sách kỹ thuật viên không bị trùng ca làm việc trong khoảng thời gian")
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
    @Operation(summary = "Phân công ca làm việc", description = "Phân công assignee, staff và technicians cho shift đang ở trạng thái PENDING_ASSIGNMENT")
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
}



