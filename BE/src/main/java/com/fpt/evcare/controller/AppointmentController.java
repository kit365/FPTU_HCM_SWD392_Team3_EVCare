package com.fpt.evcare.controller;

import com.fpt.evcare.base.ApiResponse;
import com.fpt.evcare.constants.AppointmentConstants;
import com.fpt.evcare.constants.PaginationConstants;
import com.fpt.evcare.dto.request.appointment.CreationAppointmentRequest;
import com.fpt.evcare.dto.request.appointment.UpdationAppointmentRequest;
import com.fpt.evcare.dto.request.appointment.UpdationCustomerAppointmentRequest;
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

    @GetMapping(AppointmentConstants.SERVICE_MODE)
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

    @GetMapping(AppointmentConstants.CANCEL_STATUS)
    @Operation(summary = "Lấy Cancel Appointment Status (dùng cho khách và admin nếu muốn hủy)", description = "Hiển thị giá trị của enum Cancel Appointment Status")
    public ResponseEntity<ApiResponse<String>> getCancelStatus() {
        String status = appointmentService.getCancelStatus();

        log.info(AppointmentConstants.LOG_SUCCESS_SHOWING_APPOINTMENT_CANCELLED_STATUS);
        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .success(true)
                        .message(AppointmentConstants.MESSAGE_SUCCESS_SHOWING_APPOINTMENT_CANCELLED_STATUS)
                        .data(status)
                        .build()
        );
    }

    @GetMapping(AppointmentConstants.IN_PROGRESS_STATUS)
    @Operation(summary = "Lấy In Progress Appointment Status (dùng cho admin khi chuyển trạng thái)", description = "Hiển thị giá trị của enum In Progress Appointment Status")
    public ResponseEntity<ApiResponse<String>> getInProgressStatus() {
        String status = appointmentService.getInProgressStatus();

        log.info(AppointmentConstants.LOG_SUCCESS_SHOWING_APPOINTMENT_IN_PROGRESS_STATUS);
        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .success(true)
                        .message(AppointmentConstants.MESSAGE_SUCCESS_SHOWING_APPOINTMENT_IN_PROGRESS_STATUS)
                        .data(status)
                        .build()
        );
    }

    @GetMapping(AppointmentConstants.SEARCH_BY_CUSTOMER)
    @Operation(summary = "Tra cứu danh sách cuộc hẹn cho khách hàng bằng email hoặc sđt", description = "Tra cứu danh sách cuộc hẹn cho khách hàng")
    public ResponseEntity<ApiResponse<PageResponse<AppointmentResponse>>> getAllAppointmentsByEmailOrPhoneForCustomer(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "pageSize", defaultValue = "10") int pageSize,
            @Nullable @RequestParam(name = "keyword") String keyword) {

        Pageable pageable = PageRequest.of(page, pageSize);
        PageResponse<AppointmentResponse> response = appointmentService.getAllAppointmentsByEmailOrPhoneForCustomer(keyword, pageable);

        log.info(AppointmentConstants.LOG_SUCCESS_SHOWING_SEARCH_APPOINTMENT_FOR_CUSTOMER);
        return ResponseEntity
                .ok(ApiResponse.<PageResponse<AppointmentResponse>>builder()
                        .success(true)
                        .message(AppointmentConstants.MESSAGE_SUCCESS_SHOWING_SEARCH_APPOINTMENT_FOR_CUSTOMER)
                        .data(response)
                        .build()
                );
    }

    @GetMapping(AppointmentConstants.SEARCH_BY_GUEST)
    @Operation(summary = "Tra cứu danh sách cuộc hẹn cho khách vãng lai bằng email hoặc sđt", description = "Tra cứu danh sách cuộc hẹn cho khách vãng lai")
    public ResponseEntity<ApiResponse<PageResponse<AppointmentResponse>>> getAllAppointmentsByEmailOrPhoneForGuest(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "pageSize", defaultValue = "10") int pageSize,
            @Nullable @RequestParam(name = "keyword") String keyword) {

        Pageable pageable = PageRequest.of(page, pageSize);
        PageResponse<AppointmentResponse> response = appointmentService.getAllAppointmentsByEmailOrPhoneForGuest(keyword, pageable);

        log.info(AppointmentConstants.LOG_SUCCESS_SHOWING_SEARCH_APPOINTMENT_FOR_GUEST);
        return ResponseEntity
                .ok(ApiResponse.<PageResponse<AppointmentResponse>>builder()
                        .success(true)
                        .message(AppointmentConstants.MESSAGE_SUCCESS_SHOWING_SEARCH_APPOINTMENT_FOR_GUEST)
                        .data(response)
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

    @PatchMapping(AppointmentConstants.APPOINTMENT_UPDATE_CUSTOMER)
    @Operation(summary = "Cập nhật 1 cuộc hẹn cho người dùng ", description = "Câp nhật thông tin cuộc hẹn của người dùng đó")
    public ResponseEntity<ApiResponse<String>> updateAppointmentForCustomer(@PathVariable(name = "id") UUID id, @Valid @RequestBody UpdationCustomerAppointmentRequest updationCustomerAppointmentRequest) {
        boolean response = appointmentService.updateAppointmentForCustomer(id, updationCustomerAppointmentRequest) ;

        log.info(AppointmentConstants.LOG_SUCCESS_UPDATING_APPOINTMENT_CUSTOMER);
        return ResponseEntity
                .ok(ApiResponse.<String>builder()
                        .success(response)
                        .message(AppointmentConstants.MESSAGE_SUCCESS_UPDATING_APPOINTMENT_CUSTOMER)
                        .build()
                );
    }

    @PatchMapping(AppointmentConstants.APPOINTMENT_UPDATE_ADMIN)
    @Operation(summary = "Cập nhật 1 cuộc hẹn bên phía admin ", description = "Câp nhật thông tin cuộc hẹn bên phía admin")
    public ResponseEntity<ApiResponse<String>> updateAppointmentForStaff(@PathVariable(name = "id") UUID id, @Valid @RequestBody UpdationAppointmentRequest updationAppointmentRequest) {
        boolean response = appointmentService.updateAppointmentForStaff(id, updationAppointmentRequest);

        log.info(AppointmentConstants.LOG_SUCCESS_UPDATING_APPOINTMENT_ADMIN);
        return ResponseEntity
                .ok(ApiResponse.<String>builder()
                        .success(response)
                        .message(AppointmentConstants.MESSAGE_SUCCESS_UPDATING_APPOINTMENT_ADMIN)
                        .build()
                );
    }

    @PatchMapping(AppointmentConstants.APPOINTMENT_UPDATE_STATUS)
    @Operation(summary = "Cập nhật 1 trạng thái cuộc hẹn ", description = "Câp nhật trạng thái cuộc hẹn (chỉ admin được phép xài)")
    public ResponseEntity<ApiResponse<String>> updateAppointmentStatus(@PathVariable(name = "id") UUID id, @RequestBody String status) {
        appointmentService.updateAppointmentStatus(id, status);

        log.info(AppointmentConstants.LOG_SUCCESS_UPDATING_APPOINTMENT_STATUS);
        return ResponseEntity
                .ok(ApiResponse.<String>builder()
                        .success(true)
                        .message(AppointmentConstants.MESSAGE_SUCCESS_UPDATING_APPOINTMENT_STATUS)
                        .build()
                );
    }
}
