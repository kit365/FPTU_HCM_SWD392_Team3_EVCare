package com.fpt.evcare.controller;

import com.fpt.evcare.base.ApiResponse;
import com.fpt.evcare.constants.MessageConstants;
import com.fpt.evcare.dto.request.message.MessageAssignmentRequest;

import com.fpt.evcare.dto.response.MessageAssignmentResponse;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.dto.response.UserResponse;
import com.fpt.evcare.service.MessageAssignmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/message-assignments")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Message Assignment API", description = "API quản lý phân công chat customer-staff")
public class MessageAssignmentController {
    
    MessageAssignmentService assignmentService;
    

    @PostMapping
    @Operation(summary = "Phân công customer cho staff", description = "🔐 ADMIN only - Phân công customer chat với staff")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MessageAssignmentResponse>> assignCustomerToStaff(
            @Valid @RequestBody MessageAssignmentRequest request,
            @RequestHeader("user-id") String adminIdStr
    ) {
        UUID adminId = UUID.fromString(adminIdStr);
        MessageAssignmentResponse response = assignmentService.assignCustomerToStaff(request, adminId);
        
        return ResponseEntity.ok(ApiResponse.<MessageAssignmentResponse>builder()
                .success(true)
                .message(MessageConstants.MESSAGE_SUCCESS_ASSIGN)
                .data(response)
                .build());
    }
    
    /**
     * Lấy staff được assign cho customer
     */
    @GetMapping("/customer/{customerId}")
    @Operation(summary = "Lấy staff của customer", description = "🔐 Authenticated - Lấy staff được assign cho customer")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<MessageAssignmentResponse>> getAssignmentByCustomerId(
            @PathVariable UUID customerId
    ) {
        MessageAssignmentResponse response = assignmentService.getAssignmentByCustomerId(customerId);
        
        return ResponseEntity.ok(ApiResponse.<MessageAssignmentResponse>builder()
                .success(true)
                .message("Lấy thông tin phân công thành công")
                .data(response)
                .build());
    }
    
    /**
     * Lấy danh sách customers được assign cho staff
     */
    @GetMapping("/staff/{staffId}")
    @Operation(summary = "Lấy danh sách customers của staff", description = "🔐 STAFF/ADMIN - Lấy customers được assign")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<MessageAssignmentResponse>>> getAssignmentsByStaffId(
            @PathVariable UUID staffId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize
    ) {
        Pageable pageable = PageRequest.of(page, pageSize);
        PageResponse<MessageAssignmentResponse> response = assignmentService.getAssignmentsByStaffId(staffId, pageable);
        
        return ResponseEntity.ok(ApiResponse.<PageResponse<MessageAssignmentResponse>>builder()
                .success(true)
                .message("Lấy danh sách phân công thành công")
                .data(response)
                .build());
    }
    
    /**
     * Lấy tất cả assignments (admin)
     */
    @GetMapping
    @Operation(summary = "Lấy tất cả assignments", description = "🔐 ADMIN only - Lấy tất cả phân công chat")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<MessageAssignmentResponse>>> getAllAssignments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize
    ) {
        Pageable pageable = PageRequest.of(page, pageSize);
        PageResponse<MessageAssignmentResponse> response = assignmentService.getAllAssignments(pageable);
        
        return ResponseEntity.ok(ApiResponse.<PageResponse<MessageAssignmentResponse>>builder()
                .success(true)
                .message("Lấy danh sách phân công thành công")
                .data(response)
                .build());
    }
    
    /**
     * Lấy danh sách customers chưa được assign
     */
    @GetMapping("/unassigned-customers")
    @Operation(summary = "Lấy customers chưa được phân công", description = "🔐 ADMIN only - Lấy danh sách customers chưa có staff")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getUnassignedCustomers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize
    ) {
        Pageable pageable = PageRequest.of(page, pageSize);
        PageResponse<UserResponse> response = assignmentService.getUnassignedCustomers(pageable);
        
        return ResponseEntity.ok(ApiResponse.<PageResponse<UserResponse>>builder()
                .success(true)
                .message("Lấy danh sách customers chưa phân công thành công")
                .data(response)
                .build());
    }
    
    /**
     * Hủy assignment (inactive)
     */
    @PutMapping("/{assignmentId}/deactivate")
    @Operation(summary = "Hủy phân công", description = "🔐 ADMIN only - Hủy phân công chat")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deactivateAssignment(
            @PathVariable UUID assignmentId,
            @RequestHeader("user-id") String adminIdStr
    ) {
        UUID adminId = UUID.fromString(adminIdStr);
        assignmentService.deactivateAssignment(assignmentId, adminId);
        
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(true)
                .message("Hủy phân công thành công")
                .data("Assignment deactivated")
                .build());
    }
    
    /**
     * Reassign customer sang staff khác
     */
    @PutMapping("/reassign")
    @Operation(summary = "Chuyển phân công", description = "🔐 ADMIN only - Chuyển customer sang staff khác")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MessageAssignmentResponse>> reassignCustomer(
            @RequestParam UUID customerId,
            @RequestParam UUID newStaffId,
            @RequestHeader("user-id") String adminIdStr
    ) {
        UUID adminId = UUID.fromString(adminIdStr);
        MessageAssignmentResponse response = assignmentService.reassignCustomer(customerId, newStaffId, adminId);
        
        return ResponseEntity.ok(ApiResponse.<MessageAssignmentResponse>builder()
                .success(true)
                .message(MessageConstants.MESSAGE_SUCCESS_REASSIGN)
                .data(response)
                .build());
    }
    
    /**
     * Tự động phân công staff cho customer (load balancing)
     */
    @PostMapping("/auto-assign/{customerId}")
    @Operation(summary = "Tự động phân công staff", description = "🔐 CUSTOMER - Tự động assign staff (load balancing)")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<MessageAssignmentResponse>> autoAssignStaff(
            @PathVariable UUID customerId
    ) {
        MessageAssignmentResponse response = assignmentService.autoAssignCustomerToStaff(customerId);
        
        return ResponseEntity.ok(ApiResponse.<MessageAssignmentResponse>builder()
                .success(true)
                .message("Đã tự động phân công staff")
                .data(response)
                .build());
    }
}

