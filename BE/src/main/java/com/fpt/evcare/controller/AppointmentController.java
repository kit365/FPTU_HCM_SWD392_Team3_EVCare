package com.fpt.evcare.controller;

import com.fpt.evcare.base.ApiResponse;
import com.fpt.evcare.constants.AppointmentConstants;
import com.fpt.evcare.constants.PaginationConstants;
import com.fpt.evcare.dto.request.appointment.CreationAppointmentRequest;
import com.fpt.evcare.dto.request.appointment.UpdationAppointmentRequest;
import com.fpt.evcare.dto.response.AppointmentResponse;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.entity.ServiceTypeEntity;
import com.fpt.evcare.enums.AppointmentStatusEnum;
import com.fpt.evcare.service.AppointmentService;
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

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping(AppointmentConstants.BASE_URL)
public class AppointmentController {

    AppointmentService appointmentService;

    @GetMapping(AppointmentConstants.APPOINTMENT_STATUS)
    @Operation(summary = "Lấy danh sách Service Mode", description = "Hiển thị toàn bộ các giá trị của enum ServiceModeEnum")
    public ResponseEntity<ApiResponse<List<String>>> getAllServiceModes() {
        List<String> serviceModes = appointmentService.getAllServiceMode();

        log.info(AppointmentConstants.LOG_SUCCESS_SHOWING_SERVICE_MODE_LIST);
        return ResponseEntity.ok(
                ApiResponse.<List<String>>builder()
                        .success(true)
                        .message(AppointmentConstants.MESSAGE_SUCCESS_SHOWING_SERVICE_MODE_LIST)
                        .data(serviceModes)
                        .build()
        );
    }

    @GetMapping(AppointmentConstants.SERVICE_MODE)
    @Operation(summary = "Lấy danh sách Appointment Status", description = "Hiển thị toàn bộ các giá trị của enum AppointmentStatusEnum")
    public ResponseEntity<ApiResponse<List<String>>> getAllStatuses() {
        List<String> statuses = appointmentService.getAllStatus();

        log.info(AppointmentConstants.LOG_SUCCESS_SHOWING_APPOINTMENT_STATUS_LIST);
        return ResponseEntity.ok(
                ApiResponse.<List<String>>builder()
                        .success(true)
                        .message(AppointmentConstants.MESSAGE_SUCCESS_SHOWING_APPOINTMENT_STATUS_LIST)
                        .data(statuses)
                        .build()
        );
    }

    @GetMapping(AppointmentConstants.APPOINTMENT)
    @Operation(summary = "Lấy thông tin cụ thể 1 cuộc hẹn ", description = "Từ id của cuộc hẹn, show toàn bộ thông tin của cuộc hẹn đó")
    public ResponseEntity<ApiResponse<AppointmentResponse>> getAppointmentById(@PathVariable UUID id) {
        AppointmentResponse response = appointmentService.getAppointmentById(id);

        log.info(AppointmentConstants.LOG_SUCCESS_SHOWING_APPOINTMENT);
        return ResponseEntity
                .ok(ApiResponse.<AppointmentResponse>builder()
                        .success(true)
                        .message(AppointmentConstants.MESSAGE_SUCCESS_SHOWING_APPOINTMENT)
                        .data(response)
                        .build()
                );
    }

    @GetMapping(AppointmentConstants.APPOINTMENT_QUOTE_PRICE_CALCULATING)
    @Operation(summary = "Lấy giá tạm tính cho cuộc hẹn", description = "Từ danh sách dịch vụ mà người dùng chọn, tính ra giá tạm tính để khách hàng biết giá cụ thể cho dịch vụ đó (nhưng chưa thể tính vì có chi phí phát sinh trong quá trình bảo dưỡng")
    public ResponseEntity<ApiResponse<BigDecimal>> calculateQuotePrice(@RequestBody @Valid List<ServiceTypeEntity> serviceTypeEntityList) {
        BigDecimal response = appointmentService.calculateQuotePrice(serviceTypeEntityList);

        log.info(AppointmentConstants.LOG_SUCCESS_SHOWING_APPOINTMENT);
        return ResponseEntity
                .ok(ApiResponse.<BigDecimal>builder()
                        .success(true)
                        .message(AppointmentConstants.MESSAGE_SUCCESS_SHOWING_APPOINTMENT)
                        .data(response)
                        .build()
                );
    }

    @GetMapping(AppointmentConstants.APPOINTMENT_LIST)
    @Operation(summary = "Lấy thông tin danh sách cuộc hẹn ", description = "Show toàn bộ thông tin các cuộc hẹn hiện có")
    public ResponseEntity<ApiResponse<PageResponse<AppointmentResponse>>> searchAppointment(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "pageSize", defaultValue = "10") int pageSize,
            @Nullable @RequestParam(name = "keyword") String keyword) {

        Pageable pageable = PageRequest.of(page, pageSize);
        PageResponse<AppointmentResponse> response = appointmentService.searchAppointment(keyword, pageable);

        log.info(AppointmentConstants.LOG_SUCCESS_SHOWING_APPOINTMENT_LIST);
        return ResponseEntity
                .ok(ApiResponse.<PageResponse<AppointmentResponse>>builder()
                        .success(true)
                        .message(AppointmentConstants.MESSAGE_SUCCESS_SHOWING_APPOINTMENT_LIST)
                        .data(response)
                        .build()
                );
    }

    @GetMapping(AppointmentConstants.APPOINTMENT_BY_USER_ID)
    @Operation(summary = "Lấy thông tin cuộc hẹn của người dùng ", description = "Show thông tin cụ thể 1 cuộc hẹn của người dùng đó")
    public ResponseEntity<ApiResponse<PageResponse<AppointmentResponse>>> getAppointmentByUserId(
            @RequestParam(name = PaginationConstants.PAGE_KEY, defaultValue = "0") int page,
            @RequestParam(name = PaginationConstants.PAGE_SIZE_KEY, defaultValue = "10") int pageSize,
            @Nullable @RequestParam(name = PaginationConstants.KEYWORD_KEY) String keyword,
            @PathVariable(name = PaginationConstants.USER_ID) UUID userId) {

        Pageable pageable = PageRequest.of(page, pageSize);
        PageResponse<AppointmentResponse> response = appointmentService.getAppointmentsByUserId(userId, keyword, pageable);

        log.info(AppointmentConstants.LOG_SUCCESS_SHOWING_USER_APPOINTMENT);
        return ResponseEntity
                .ok(ApiResponse.<PageResponse<AppointmentResponse>>builder()
                        .success(true)
                        .message(AppointmentConstants.MESSAGE_SUCCESS_SHOWING_USER_APPOINTMENT)
                        .data(response)
                        .build()
                );
    }

    @PostMapping(AppointmentConstants.APPOINTMENT_CREATION)
    @Operation(summary = "Tạo 1 cuộc hẹn ", description = "Tạo cuộc hẹn cho người dùng")
    public ResponseEntity<ApiResponse<String>> createAppointment(@Valid @RequestBody CreationAppointmentRequest creationAppointmentRequest) {
        boolean response = appointmentService.addAppointment(creationAppointmentRequest);

        log.info(AppointmentConstants.LOG_SUCCESS_CREATING_APPOINTMENT);
        return ResponseEntity
                .ok(ApiResponse.<String>builder()
                        .success(response)
                        .message(AppointmentConstants.MESSAGE_SUCCESS_CREATING_APPOINTMENT)
                        .build()
                );
    }

    @PatchMapping(AppointmentConstants.APPOINTMENT_UPDATE)
    @Operation(summary = "Cập nhật 1 cuộc hẹn ", description = "Câp nhật thông tin của cuộc hẹn đó")
    public ResponseEntity<ApiResponse<String>> updateAppointment(@PathVariable(name = "id") UUID id, @Valid @RequestBody UpdationAppointmentRequest updationAppointmentRequest) {
        boolean response = appointmentService.updateAppointment(id, updationAppointmentRequest);

        log.info(AppointmentConstants.LOG_SUCCESS_UPDATING_APPOINTMENT);
        return ResponseEntity
                .ok(ApiResponse.<String>builder()
                        .success(response)
                        .message(AppointmentConstants.MESSAGE_SUCCESS_UPDATING_APPOINTMENT_STATUS)
                        .build()
                );
    }

    @PatchMapping(AppointmentConstants.APPOINTMENT_STATUS_UPDATE)
    @Operation(summary = "Cập nhật trạng thái 1 cuộc hẹn ", description = "Câp nhật trạng thái của cuộc hẹn đó")
    public ResponseEntity<ApiResponse<String>> updateAppointmentStatus(@PathVariable UUID id, @RequestBody String statusEnum) {
        boolean response = appointmentService.updateAppointmentStatus(id, statusEnum);

        log.info(AppointmentConstants.LOG_SUCCESS_UPDATING_APPOINTMENT_STATUS, statusEnum);
        return ResponseEntity
                .ok(ApiResponse.<String>builder()
                        .success(response)
                        .message(AppointmentConstants.MESSAGE_SUCCESS_UPDATING_APPOINTMENT)
                        .build()
                );
    }

    @DeleteMapping(AppointmentConstants.APPOINTMENT_DELETE)
    @Operation(summary = "Xóa 1 cuộc hẹn ", description = "Xóa 1 cuộc hẹn")
    public ResponseEntity<ApiResponse<String>> updateAppointment(@PathVariable(name = "id") UUID id) {
        boolean response = appointmentService.deleteAppointment(id);

        log.info(AppointmentConstants.LOG_SUCCESS_DELETING_APPOINTMENT);
        return ResponseEntity
                .ok(ApiResponse.<String>builder()
                        .success(response)
                        .message(AppointmentConstants.MESSAGE_SUCCESS_DELETING_APPOINTMENT)
                        .build()
                );
    }

    @PatchMapping(AppointmentConstants.APPOINTMENT_RESTORE)
    @Operation(summary = "Khôi phục 1 cuộc hẹn ", description = "Xóa 1 cuộc hẹn")
    public ResponseEntity<ApiResponse<String>> restoreAppointment(@PathVariable(name = "id") UUID id) {
        boolean response = appointmentService.restoreAppointment(id);

        log.info(AppointmentConstants.LOG_SUCCESS_RESTORING_APPOINTMENT);
        return ResponseEntity
                .ok(ApiResponse.<String>builder()
                        .success(response)
                        .message(AppointmentConstants.MESSAGE_SUCCESS_RESTORING_APPOINTMENT)
                        .build()
                );
    }
}
