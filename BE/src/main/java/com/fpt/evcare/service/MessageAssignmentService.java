package com.fpt.evcare.service;

import com.fpt.evcare.dto.request.message.MessageAssignmentRequest;
import com.fpt.evcare.dto.response.MessageAssignmentResponse;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.dto.response.UserResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface MessageAssignmentService {
    
    /**
     * Phân công staff chat với customer
     * - Chỉ admin mới có quyền
     * - 1 customer chỉ được assign 1 staff tại 1 thời điểm
     * - Nếu đã assign, sẽ inactive assignment cũ và tạo mới
     */
    MessageAssignmentResponse assignCustomerToStaff(
        MessageAssignmentRequest request, 
        UUID assignedById
    );
    
    /**
     * Lấy staff được assign cho customer
     */
    MessageAssignmentResponse getAssignmentByCustomerId(UUID customerId);
    
    /**
     * Lấy danh sách customers được assign cho staff
     */
    PageResponse<MessageAssignmentResponse> getAssignmentsByStaffId(UUID staffId, Pageable pageable);
    
    /**
     * Lấy tất cả assignments (cho admin)
     */
    PageResponse<MessageAssignmentResponse> getAllAssignments(Pageable pageable);
    
    /**
     * Lấy danh sách customers chưa được assign
     */
    PageResponse<UserResponse> getUnassignedCustomers(Pageable pageable);
    
    /**
     * Hủy assignment (inactive)
     */
    void deactivateAssignment(UUID assignmentId, UUID adminId);
    
    /**
     * Reassign customer sang staff khác
     */
    MessageAssignmentResponse reassignCustomer(
        UUID customerId, 
        UUID newStaffId, 
        UUID assignedById
    );
    
    /**
     * Tự động phân công staff cho customer (load balancing)
     * - Chọn staff có ít customers nhất
     * - Nếu customer đã có assignment, return existing
     */
    MessageAssignmentResponse autoAssignCustomerToStaff(UUID customerId);
}

