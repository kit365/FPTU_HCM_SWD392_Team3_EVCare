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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
    com.fpt.evcare.service.RedisService<String> redisService;
    com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @GetMapping(AppointmentConstants.SERVICE_MODE)
    @Operation(summary = "Lấy danh sách Service Mode", description = "🔓 **Public** - Hiển thị toàn bộ các giá trị của enum ServiceModeEnum")
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

        // Validate pageSize to ensure it's at least 1
        if (pageSize < 1) {
            pageSize = 10; // Default to 10 if invalid
        }
        // Validate page to ensure it's not negative
        if (page < 0) {
            page = 0;
        }

        // Lấy userId từ SecurityContext nếu user đã authenticated
        UUID currentUserId = null;
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() && !authentication.getName().equals("anonymousUser")) {
                String userIdStr = authentication.getName();
                currentUserId = UUID.fromString(userIdStr);
                log.info("👤 Current authenticated user ID: {}", currentUserId);
            }
        } catch (Exception e) {
            log.warn("Could not parse userId from SecurityContext: {}", e.getMessage());
        }

        Pageable pageable = PageRequest.of(page, pageSize);
        PageResponse<AppointmentResponse> response = appointmentService.getAllAppointmentsByEmailOrPhoneForCustomer(keyword, currentUserId, pageable);

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

        // Validate pageSize to ensure it's at least 1
        if (pageSize < 1) {
            pageSize = 10; // Default to 10 if invalid
        }
        // Validate page to ensure it's not negative
        if (page < 0) {
            page = 0;
        }

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
    @Operation(summary = "Lấy thông tin cụ thể 1 cuộc hẹn ", description = "🔧 **Roles:** ADMIN, STAFF, TECHNICIAN, CUSTOMER - Từ id của cuộc hẹn, show toàn bộ thông tin của cuộc hẹn đó. CUSTOMER chỉ xem được cuộc hẹn của mình.")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'TECHNICIAN', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<AppointmentResponse>> getAppointmentById(@PathVariable UUID id) {
        // Kiểm tra xem user có phải customer không, nếu có thì chỉ cho xem cuộc hẹn của mình
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UUID currentUserId = null;
        if (authentication != null && authentication.isAuthenticated() && !authentication.getName().equals("anonymousUser")) {
            try {
                String userIdStr = authentication.getName();
                currentUserId = UUID.fromString(userIdStr);
                log.info("👤 Current authenticated user ID: {}", currentUserId);
            } catch (Exception e) {
                log.warn("Could not parse userId from SecurityContext: {}", e.getMessage());
            }
        }
        
        AppointmentResponse response = appointmentService.getAppointmentById(id, currentUserId);

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

    @GetMapping(AppointmentConstants.WARRANTY_APPOINTMENTS)
    @Operation(summary = "Lấy danh sách warranty appointments (COMPLETED và isWarrantyAppointment = true)", 
            description = "👨‍💼 **Roles:** ADMIN, STAFF - Lấy danh sách các cuộc hẹn bảo hành đã hoàn thành")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<PageResponse<AppointmentResponse>>> getWarrantyAppointments(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "pageSize", defaultValue = "10") int pageSize,
            @Nullable @RequestParam(name = "keyword") String keyword) {
        
        Pageable pageable = PageRequest.of(page, pageSize);
        PageResponse<AppointmentResponse> response = appointmentService.getWarrantyAppointments(keyword, pageable);
        
        log.info(AppointmentConstants.LOG_SUCCESS_SHOWING_APPOINTMENT_LIST);
        return ResponseEntity
                .ok(ApiResponse.<PageResponse<AppointmentResponse>>builder()
                        .success(true)
                        .message(AppointmentConstants.MESSAGE_SUCCESS_SHOWING_WARRANTY_APPOINTMENT_LIST)
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
    @Operation(summary = "Tạo 1 cuộc hẹn ", description = "🔓 **Public** - Tạo cuộc hẹn (không cần đăng nhập). Nếu user đã đăng nhập, tự động set customerId từ SecurityContext.")
    public ResponseEntity<ApiResponse<String>> createAppointment(@Valid @RequestBody CreationAppointmentRequest creationAppointmentRequest) {
        log.info("🎬 Controller received request with customerId: {}", creationAppointmentRequest.getCustomerId());
        log.info("📧 Customer email from request: {}", creationAppointmentRequest.getCustomerEmail());
        
        // Nếu request không có customerId nhưng user đã authenticated, tự động lấy từ SecurityContext
        if (creationAppointmentRequest.getCustomerId() == null) {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            log.info("🔍 SecurityContext authentication: {}", authentication != null ? authentication.getName() : "NULL");
            log.info("🔍 Is authenticated: {}", authentication != null && authentication.isAuthenticated());
            
            if (authentication != null && authentication.isAuthenticated() && !authentication.getName().equals("anonymousUser")) {
                try {
                    String userIdStr = authentication.getName();
                    UUID currentUserId = UUID.fromString(userIdStr);
                    creationAppointmentRequest.setCustomerId(currentUserId);
                    log.info("✅ Auto-set customerId from SecurityContext: {}", currentUserId);
                } catch (Exception e) {
                    log.warn("⚠️ Could not parse userId from SecurityContext: {}", e.getMessage());
                }
            } else {
                log.info("ℹ️ No authenticated user found in SecurityContext - creating appointment as guest");
            }
        } else {
            log.info("✅ Request already has customerId: {}", creationAppointmentRequest.getCustomerId());
        }
        
        // Log lại customerId sau khi xử lý
        log.info("🎯 Final customerId before calling service: {}", creationAppointmentRequest.getCustomerId());
        
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

    // Hủy appointment cho customer (chỉ cho phép hủy khi status là PENDING)
    @PatchMapping(AppointmentConstants.APPOINTMENT_CANCEL_CUSTOMER)
    @Operation(summary = "Hủy cuộc hẹn (dành cho khách hàng)", description = "🔐 **Roles:** Authenticated (All roles) - Hủy cuộc hẹn, chỉ cho phép khi appointment đang ở trạng thái PENDING")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> cancelAppointmentForCustomer(@PathVariable(name = "id") UUID id) {
        appointmentService.cancelAppointmentForCustomer(id);

        log.info(AppointmentConstants.LOG_SUCCESS_CANCELLING_APPOINTMENT_CUSTOMER);
        return ResponseEntity
                .ok(ApiResponse.<String>builder()
                        .success(true)
                        .message(AppointmentConstants.MESSAGE_SUCCESS_CANCELLING_APPOINTMENT_CUSTOMER)
                        .build()
                );
    }

    // Gửi OTP cho guest appointment
    @PostMapping(AppointmentConstants.APPOINTMENT_GUEST_SEND_OTP)
    @Operation(summary = "Gửi mã OTP cho khách vãng lai để xác thực", description = "🔓 **Public** - Gửi mã OTP đến email để xác thực xem chi tiết appointment")
    public ResponseEntity<ApiResponse<String>> sendOtpForGuestAppointment(
            @PathVariable(name = "id") UUID appointmentId,
            @RequestBody java.util.Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.trim().isEmpty()) {
            throw new com.fpt.evcare.exception.EntityValidationException("Email không được để trống");
        }
        appointmentService.sendOtpForGuestAppointment(appointmentId, email.trim());
        
        log.info(AppointmentConstants.LOG_SUCCESS_SEND_OTP_FOR_GUEST, appointmentId);
        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .success(true)
                        .message(AppointmentConstants.MESSAGE_SUCCESS_SEND_OTP_FOR_GUEST)
                        .build()
        );
    }

    // Verify OTP và lấy appointment details cho guest
    @PostMapping(AppointmentConstants.APPOINTMENT_GUEST_VERIFY_OTP)
    @Operation(summary = "Xác thực OTP và lấy chi tiết appointment cho khách vãng lai", description = "🔓 **Public** - Xác thực OTP và trả về chi tiết appointment")
    public ResponseEntity<ApiResponse<AppointmentResponse>> verifyOtpForGuestAppointment(
            @PathVariable(name = "id") UUID appointmentId,
            @RequestBody java.util.Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        if (email == null || email.trim().isEmpty()) {
            throw new com.fpt.evcare.exception.EntityValidationException("Email không được để trống");
        }
        if (otp == null || otp.trim().isEmpty()) {
            throw new com.fpt.evcare.exception.EntityValidationException("Mã OTP không được để trống");
        }
        
        AppointmentResponse response = appointmentService.verifyOtpForGuestAppointment(appointmentId, email.trim(), otp.trim());
        
        log.info(AppointmentConstants.LOG_SUCCESS_VERIFY_OTP_FOR_GUEST, appointmentId);
        return ResponseEntity.ok(
                ApiResponse.<AppointmentResponse>builder()
                        .success(true)
                        .message(AppointmentConstants.MESSAGE_SUCCESS_VERIFY_OTP_FOR_GUEST)
                        .data(response)
                        .build()
        );
    }

    // Cập nhật appointment cho guest (với OTP verification)
    @PatchMapping(AppointmentConstants.APPOINTMENT_GUEST_UPDATE)
    @Operation(summary = "Cập nhật appointment cho khách vãng lai (với OTP verification)", description = "🔓 **Public** - Cập nhật appointment sau khi xác thực OTP, chỉ cho phép khi status là PENDING")
    public ResponseEntity<ApiResponse<String>> updateGuestAppointment(
            @PathVariable(name = "id") UUID appointmentId,
            @RequestBody java.util.Map<String, Object> request) {
        String email = (String) request.get("email");
        String otp = (String) request.get("otp");
        UpdationCustomerAppointmentRequest updateRequest = null;
        
        try {
            // Convert request body to UpdationCustomerAppointmentRequest
            // Remove email and otp from request map first
            java.util.Map<String, Object> requestData = new java.util.HashMap<>(request);
            requestData.remove("email");
            requestData.remove("otp");
            
            // Convert Map to JSON string first, then parse to DTO
            // This ensures proper parsing of LocalDateTime from ISO string format
            String jsonString = objectMapper.writeValueAsString(requestData);
            updateRequest = objectMapper.readValue(jsonString, UpdationCustomerAppointmentRequest.class);
        } catch (Exception e) {
            log.error("Error converting request to DTO: {}", e.getMessage(), e);
            throw new com.fpt.evcare.exception.EntityValidationException("Dữ liệu cập nhật không hợp lệ: " + e.getMessage());
        }
        
        if (email == null || email.trim().isEmpty()) {
            throw new com.fpt.evcare.exception.EntityValidationException("Email không được để trống");
        }
        if (otp == null || otp.trim().isEmpty()) {
            throw new com.fpt.evcare.exception.EntityValidationException("Mã OTP không được để trống");
        }
        
        // Verify OTP trước khi update (không xóa OTP ngay)
        appointmentService.verifyOtpForGuestAppointment(appointmentId, email.trim(), otp.trim());
        
        // Kiểm tra appointment status phải là PENDING trước khi cho phép update
        AppointmentResponse appointmentResponse = appointmentService.getAppointmentById(appointmentId);
        if (appointmentResponse.getStatus() != com.fpt.evcare.enums.AppointmentStatusEnum.PENDING) {
            throw new com.fpt.evcare.exception.EntityValidationException("Chỉ có thể chỉnh sửa cuộc hẹn khi đang ở trạng thái PENDING");
        }
        
        // Verify OTP lại trước khi update (để đảm bảo OTP vẫn còn hiệu lực và chưa bị xóa)
        String otpKey = "guest_appointment_otp:" + appointmentId + ":" + email.trim().toLowerCase();
        String storedOtp = redisService.getValue(otpKey);
        if (storedOtp == null || !storedOtp.equals(otp.trim())) {
            throw new com.fpt.evcare.exception.EntityValidationException(AppointmentConstants.MESSAGE_ERR_OTP_INVALID);
        }
        
        // Sau khi verify OTP thành công và kiểm tra status, sử dụng hàm updateAppointmentForCustomer
        boolean response = appointmentService.updateAppointmentForCustomer(appointmentId, updateRequest);
        
        // Xóa OTP sau khi update thành công
        redisService.delete(otpKey);
        
        log.info(AppointmentConstants.LOG_SUCCESS_UPDATING_APPOINTMENT_CUSTOMER, appointmentId);
        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .success(response)
                        .message(AppointmentConstants.MESSAGE_SUCCESS_UPDATING_APPOINTMENT_CUSTOMER)
                        .build()
        );
    }

    @GetMapping(AppointmentConstants.APPOINTMENT_MAINTENANCE_DETAILS)
    @Operation(summary = "Lấy chi tiết phụ tùng và dịch vụ của appointment", 
            description = "👤 **Roles:** Tất cả - Lấy danh sách phụ tùng đã sử dụng và thông tin bảo hành (nếu có)")
    public ResponseEntity<ApiResponse<java.util.List<com.fpt.evcare.dto.response.InvoiceResponse.MaintenanceManagementSummary>>> getMaintenanceDetails(
            @PathVariable("id") UUID appointmentId) {
        
        java.util.List<com.fpt.evcare.dto.response.InvoiceResponse.MaintenanceManagementSummary> maintenanceDetails = 
            appointmentService.getMaintenanceDetailsByAppointmentId(appointmentId);
        
        return ResponseEntity.ok(
                ApiResponse.<java.util.List<com.fpt.evcare.dto.response.InvoiceResponse.MaintenanceManagementSummary>>builder()
                        .success(true)
                        .message("Lấy chi tiết phụ tùng thành công")
                        .data(maintenanceDetails)
                        .build()
        );
    }
}
