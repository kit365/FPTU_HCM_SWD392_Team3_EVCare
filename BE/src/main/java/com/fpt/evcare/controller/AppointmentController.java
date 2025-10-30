package com.fpt.evcare.controller;

import com.fpt.evcare.base.ApiResponse;
import com.fpt.evcare.constants.AppointmentConstants;
import com.fpt.evcare.constants.PaginationConstants;
import com.fpt.evcare.dto.request.appointment.CreationAppointmentRequest;
import com.fpt.evcare.dto.request.appointment.UpdationAppointmentRequest;
import com.fpt.evcare.dto.request.appointment.UpdationCustomerAppointmentRequest;
import com.fpt.evcare.dto.response.AppointmentResponse;
import com.fpt.evcare.dto.response.PageResponse;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
    @Operation(summary = "Lấy danh sách Service Mode", description = "🔐 **Roles:** Authenticated (All roles) - Hiển thị toàn bộ các giá trị của enum ServiceModeEnum")
    @PreAuthorize("isAuthenticated()")
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
    @Operation(summary = "Lấy Cancel Appointment Status (dùng cho khách và admin nếu muốn hủy)", description = "🔐 **Roles:** Authenticated (All roles) - Hiển thị giá trị của enum Cancel Appointment Status")
    @PreAuthorize("isAuthenticated()")
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
    @Operation(summary = "Lấy In Progress Appointment Status (dùng cho admin khi chuyển trạng thái)", description = "👨‍💼 **Roles:** ADMIN, STAFF - Hiển thị giá trị của enum In Progress Appointment Status")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
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
    @Operation(summary = "Tra cứu danh sách cuộc hẹn cho khách hàng bằng email hoặc sđt", description = "🔐 **Roles:** Authenticated (All roles) - Tra cứu danh sách cuộc hẹn cho khách hàng")
    @PreAuthorize("isAuthenticated()")
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
    @Operation(summary = "Tra cứu danh sách cuộc hẹn cho khách vãng lai bằng email hoặc sđt", description = "🔓 **Public** - Tra cứu danh sách cuộc hẹn cho khách vãng lai")
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
    @Operation(summary = "Lấy thông tin cụ thể 1 cuộc hẹn ", description = "🔧 **Roles:** ADMIN, STAFF, TECHNICIAN - Từ id của cuộc hẹn, show toàn bộ thông tin của cuộc hẹn đó")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'TECHNICIAN')")
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
    @Operation(
        summary = "Lấy danh sách cuộc hẹn với bộ lọc", 
        description = """
            Lấy danh sách cuộc hẹn với các bộ lọc tùy chọn. Tất cả parameters đều optional.
            
            Các tham số:
            - keyword: Từ khóa tìm kiếm (tên khách hàng, email, số điện thoại)
            - status: Trạng thái cuộc hẹn (PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED)
            - serviceMode: Chế độ dịch vụ (STATIONARY: tại chỗ, MOBILE: di động)
            - fromDate: Lọc từ ngày (format: yyyy-MM-dd, ví dụ: 2024-01-01)
            - toDate: Lọc đến ngày (format: yyyy-MM-dd, ví dụ: 2024-12-31)
            - page: Số trang (mặc định: 0)
            - pageSize: Số lượng mỗi trang (mặc định: 10)
            
            Ví dụ:
            - Lấy tất cả appointment: GET /api/appointment/
            - Lọc theo keyword: GET /api/appointment/?keyword=Nguyen Van A
            - Lọc appointment đang chờ: GET /api/appointment/?status=PENDING
            - Lọc appointment mobile đã hoàn thành: GET /api/appointment/?serviceMode=MOBILE&status=COMPLETED
            - Lọc trong khoảng thời gian: GET /api/appointment/?fromDate=2024-01-01&toDate=2024-12-31
            - Lọc kết hợp: GET /api/appointment/?keyword=Nguyen&status=IN_PROGRESS&fromDate=2024-01-01
            """
    )
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<PageResponse<AppointmentResponse>>> searchAppointment(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "pageSize", defaultValue = "10") int pageSize,
            @Nullable @RequestParam(name = "keyword") String keyword,
            @Nullable @RequestParam(name = "status") String status,
            @Nullable @RequestParam(name = "serviceMode") String serviceMode,
            @Nullable @RequestParam(name = "fromDate") String fromDate,
            @Nullable @RequestParam(name = "toDate") String toDate) {

        Pageable pageable = PageRequest.of(page, pageSize);
        
        // Nếu không có filter nào thì dùng method cũ
        boolean hasFilters = status != null || serviceMode != null || fromDate != null || toDate != null;
        
        PageResponse<AppointmentResponse> response;
        if (hasFilters) {
            response = appointmentService.searchAppointmentWithFilters(keyword, status, serviceMode, fromDate, toDate, pageable);
        } else {
            response = appointmentService.searchAppointment(keyword, pageable);
        }

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
    @Operation(summary = "Lấy thông tin cuộc hẹn của người dùng ", description = "👨‍💼 **Roles:** ADMIN, STAFF - Show thông tin cụ thể 1 cuộc hẹn của người dùng đó")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
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
    @Operation(summary = "Tạo 1 cuộc hẹn ", description = "🔐 **Roles:** Authenticated (All roles) - Tạo cuộc hẹn cho người dùng")
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

    //xài cho customer(update profile người dùng, nếu appoinment trong progress -> lỗi)
    @PatchMapping(AppointmentConstants.APPOINTMENT_UPDATE_CUSTOMER)
    @Operation(summary = "Cập nhật 1 cuộc hẹn cho người dùng ", description = "🔐 **Roles:** Authenticated (All roles) - Câp nhật thông tin cuộc hẹn của người dùng đó")
    @PreAuthorize("isAuthenticated()")
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


    //Xài cho shift(khi phân công -> đien thông tin của nhân viên và tenichcan)
    @PatchMapping(AppointmentConstants.APPOINTMENT_UPDATE_ADMIN)
    @Operation(summary = "Cập nhật 1 cuộc hẹn bên phía admin ", description = "👨‍💼 **Roles:** ADMIN, STAFF - Câp nhật thông tin cuộc hẹn bên phía admin")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
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


    //
    @PatchMapping(AppointmentConstants.APPOINTMENT_UPDATE_STATUS)
    @Operation(summary = "Cập nhật 1 trạng thái cuộc hẹn ", description = "👨‍💼 **Roles:** ADMIN, STAFF - Câp nhật trạng thái cuộc hẹn (chỉ admin được phép xài)")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
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
