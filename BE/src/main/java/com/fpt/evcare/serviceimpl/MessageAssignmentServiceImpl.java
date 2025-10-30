package com.fpt.evcare.serviceimpl;

import com.fpt.evcare.constants.MessageConstants;
import com.fpt.evcare.constants.UserConstants;
import com.fpt.evcare.dto.request.message.MessageAssignmentRequest;
import com.fpt.evcare.dto.response.MessageAssignmentResponse;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.dto.response.UserResponse;
import com.fpt.evcare.entity.MessageAssignmentEntity;
import com.fpt.evcare.entity.MessageEntity;
import com.fpt.evcare.entity.UserEntity;
import com.fpt.evcare.enums.RoleEnum;
import com.fpt.evcare.exception.ResourceNotFoundException;
import com.fpt.evcare.exception.UserValidationException;
import com.fpt.evcare.mapper.MessageAssignmentMapper;
import com.fpt.evcare.mapper.UserMapper;
import com.fpt.evcare.repository.MessageAssignmentRepository;
import com.fpt.evcare.repository.MessageRepository;
import com.fpt.evcare.repository.UserRepository;
import com.fpt.evcare.service.MessageAssignmentService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MessageAssignmentServiceImpl implements MessageAssignmentService {
    
    MessageAssignmentRepository assignmentRepository;
    MessageRepository messageRepository;
    UserRepository userRepository;
    MessageAssignmentMapper assignmentMapper;
    UserMapper userMapper;
    
    @Override
    @Transactional
    public MessageAssignmentResponse assignCustomerToStaff(
            MessageAssignmentRequest request, 
            UUID assignedById) {
        
        // Validate customer
        UserEntity customer = userRepository.findByUserIdAndIsDeletedFalse(request.getCustomerId());
        if (customer == null) {
            throw new ResourceNotFoundException(UserConstants.MESSAGE_ERR_USER_NOT_FOUND);
        }
        if (customer.getRole().getRoleName() != RoleEnum.CUSTOMER) {
            throw new UserValidationException("User không phải là customer");
        }
        
        // Validate staff
        UserEntity staff = userRepository.findByUserIdAndIsDeletedFalse(request.getStaffId());
        if (staff == null) {
            throw new ResourceNotFoundException(MessageConstants.MESSAGE_ERR_INVALID_STAFF);
        }
        RoleEnum staffRole = staff.getRole().getRoleName();
        if (staffRole != RoleEnum.STAFF && staffRole != RoleEnum.ADMIN) {
            throw new UserValidationException(MessageConstants.MESSAGE_ERR_INVALID_STAFF);
        }
        
        // Validate admin
        UserEntity admin = userRepository.findByUserIdAndIsDeletedFalse(assignedById);
        if (admin == null) {
            throw new ResourceNotFoundException(UserConstants.MESSAGE_ERR_USER_NOT_FOUND);
        }
        
        // Kiểm tra xem customer đã được assign chưa
        Optional<MessageAssignmentEntity> existingAssignment = 
            assignmentRepository.findActiveByCustomerId(request.getCustomerId());
        
        if (existingAssignment.isPresent()) {
            // Nếu assign cho cùng 1 staff -> không làm gì
            if (existingAssignment.get().getAssignedStaff().getUserId().equals(request.getStaffId())) {
                log.info("Customer {} already assigned to staff {}", request.getCustomerId(), request.getStaffId());
                MessageAssignmentResponse response = assignmentMapper.toResponse(existingAssignment.get());
                enrichAssignmentResponse(response);
                return response;
            }
            
            // Nếu assign cho staff khác -> inactive assignment cũ
            MessageAssignmentEntity oldAssignment = existingAssignment.get();
            oldAssignment.setIsActive(false);
            oldAssignment.setUpdatedBy(admin.getFullName());
            assignmentRepository.save(oldAssignment);
            log.info(MessageConstants.LOG_SUCCESS_REASSIGN, 
                request.getCustomerId(), 
                oldAssignment.getAssignedStaff().getUserId(), 
                request.getStaffId());
        }
        
        // Tạo assignment mới
        MessageAssignmentEntity assignment = MessageAssignmentEntity.builder()
                .customer(customer)
                .assignedStaff(staff)
                .assignedBy(admin)
                .notes(request.getNotes())
                .createdBy(admin.getFullName())
                .updatedBy(admin.getFullName())
                .build();
        
        MessageAssignmentEntity savedAssignment = assignmentRepository.save(assignment);
        log.info(MessageConstants.LOG_SUCCESS_ASSIGN, request.getCustomerId(), request.getStaffId());
        
        MessageAssignmentResponse response = assignmentMapper.toResponse(savedAssignment);
        enrichAssignmentResponse(response);
        return response;
    }
    
    @Override
    public MessageAssignmentResponse getAssignmentByCustomerId(UUID customerId) {
        Optional<MessageAssignmentEntity> assignment = 
            assignmentRepository.findActiveByCustomerId(customerId);
        
        if (assignment.isEmpty()) {
            log.warn(MessageConstants.LOG_ERR_NO_ASSIGNMENT, customerId);
            throw new ResourceNotFoundException(MessageConstants.MESSAGE_ERR_CUSTOMER_NOT_ASSIGNED);
        }
        
        MessageAssignmentResponse response = assignmentMapper.toResponse(assignment.get());
        enrichAssignmentResponse(response);
        return response;
    }
    
    @Override
    public PageResponse<MessageAssignmentResponse> getAssignmentsByStaffId(UUID staffId, Pageable pageable) {
        Page<MessageAssignmentEntity> assignmentPage = 
            assignmentRepository.findAllByStaffId(staffId, pageable);
        
        List<MessageAssignmentResponse> responses = assignmentPage.getContent().stream()
                .map(entity -> {
                    MessageAssignmentResponse response = assignmentMapper.toResponse(entity);
                    enrichAssignmentResponse(response);
                    return response;
                })
                .collect(Collectors.toList());
        
        return PageResponse.<MessageAssignmentResponse>builder()
                .page(assignmentPage.getNumber())
                .size(assignmentPage.getSize())
                .totalElements(assignmentPage.getTotalElements())
                .totalPages(assignmentPage.getTotalPages())
                .data(responses)
                .build();
    }
    
    @Override
    public PageResponse<MessageAssignmentResponse> getAllAssignments(Pageable pageable) {
        Page<MessageAssignmentEntity> assignmentPage = assignmentRepository.findAllActive(pageable);
        
        List<MessageAssignmentResponse> responses = assignmentPage.getContent().stream()
                .map(entity -> {
                    MessageAssignmentResponse response = assignmentMapper.toResponse(entity);
                    enrichAssignmentResponse(response);
                    return response;
                })
                .collect(Collectors.toList());
        
        return PageResponse.<MessageAssignmentResponse>builder()
                .page(assignmentPage.getNumber())
                .size(assignmentPage.getSize())
                .totalElements(assignmentPage.getTotalElements())
                .totalPages(assignmentPage.getTotalPages())
                .data(responses)
                .build();
    }
    
    @Override
    public PageResponse<UserResponse> getUnassignedCustomers(Pageable pageable) {
        Page<UserEntity> customerPage = assignmentRepository.findUnassignedCustomers(pageable);
        
        List<UserResponse> responses = customerPage.getContent().stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
        
        return PageResponse.<UserResponse>builder()
                .page(customerPage.getNumber())
                .size(customerPage.getSize())
                .totalElements(customerPage.getTotalElements())
                .totalPages(customerPage.getTotalPages())
                .data(responses)
                .build();
    }
    
    @Override
    @Transactional
    public void deactivateAssignment(UUID assignmentId, UUID adminId) {
        MessageAssignmentEntity assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.MESSAGE_ERR_ASSIGNMENT_NOT_FOUND));
        
        UserEntity admin = userRepository.findByUserIdAndIsDeletedFalse(adminId);
        if (admin == null) {
            throw new ResourceNotFoundException(UserConstants.MESSAGE_ERR_USER_NOT_FOUND);
        }
        
        assignment.setIsActive(false);
        assignment.setUpdatedBy(admin.getFullName());
        assignmentRepository.save(assignment);
        
        log.info("Deactivated assignment: {}", assignmentId);
    }
    
    @Override
    @Transactional
    public MessageAssignmentResponse reassignCustomer(UUID customerId, UUID newStaffId, UUID assignedById) {
        MessageAssignmentRequest request = MessageAssignmentRequest.builder()
                .customerId(customerId)
                .staffId(newStaffId)
                .notes("Reassigned")
                .build();
        
        return assignCustomerToStaff(request, assignedById);
    }
    
    @Override
    @Transactional
    public MessageAssignmentResponse autoAssignCustomerToStaff(UUID customerId) {
        // Validate customer
        UserEntity customer = userRepository.findByUserIdAndIsDeletedFalse(customerId);
        if (customer == null) {
            throw new ResourceNotFoundException(UserConstants.MESSAGE_ERR_USER_NOT_FOUND);
        }
        if (customer.getRole().getRoleName() != RoleEnum.CUSTOMER) {
            throw new UserValidationException("User không phải là customer");
        }
        
        // Check if customer already has assignment
        Optional<MessageAssignmentEntity> existing = 
            assignmentRepository.findActiveByCustomerId(customerId);
        
        if (existing.isPresent()) {
            UserEntity currentStaff = existing.get().getAssignedStaff();
            
            // Check if current staff is still online/active
            if (currentStaff.getIsActive() != null && currentStaff.getIsActive()) {
                log.info("✅ Customer {} already assigned to ONLINE staff {}, keeping assignment", 
                        customerId, currentStaff.getUserId());
                MessageAssignmentResponse response = assignmentMapper.toResponse(existing.get());
                enrichAssignmentResponse(response);
                return response;
            }
            
            // Current staff is OFFLINE -> reassign to online staff
            log.warn("⚠️ Current staff {} is OFFLINE, reassigning customer {} to online staff", 
                    currentStaff.getUserId(), customerId);
            
            // Deactivate old assignment
            MessageAssignmentEntity oldAssignment = existing.get();
            oldAssignment.setIsActive(false);
            oldAssignment.setUpdatedBy("SYSTEM");
            oldAssignment.setNotes("Auto-reassigned: staff offline");
            assignmentRepository.save(oldAssignment);
        }
        
        // Find online staff with least customers (load balancing)
        UserEntity selectedStaff = findOnlineStaffWithLeastCustomers();
        
        if (selectedStaff == null) {
            throw new ResourceNotFoundException("Không tìm thấy staff online khả dụng");
        }
        
        // Create new assignment
        MessageAssignmentEntity assignment = MessageAssignmentEntity.builder()
                .customer(customer)
                .assignedStaff(selectedStaff)
                .assignedBy(null)  // Auto-assigned by system
                .notes(existing.isPresent() ? "Auto-reassigned: previous staff offline" : "Auto-assigned by system")
                .createdBy("SYSTEM")
                .updatedBy("SYSTEM")
                .build();
        
        MessageAssignmentEntity savedAssignment = assignmentRepository.save(assignment);
        
        String action = existing.isPresent() ? "reassigned" : "assigned";
        log.info("✅ Auto-{} customer {} to online staff {} (least loaded)", 
                action, customerId, selectedStaff.getUserId());
        
        MessageAssignmentResponse response = assignmentMapper.toResponse(savedAssignment);
        enrichAssignmentResponse(response);
        return response;
    }
    
    /**
     * Find ONLINE staff with least customers (load balancing)
     * Only considers staff where isActive = true
     */
    private UserEntity findOnlineStaffWithLeastCustomers() {
        // Get all staff (including isActive status)
        List<UserEntity> allStaff = userRepository.findByRoleNameAndIsDeletedFalse(RoleEnum.STAFF);
        
        // Filter only ONLINE staff (isActive = true)
        List<UserEntity> onlineStaff = allStaff.stream()
                .filter(staff -> staff.getIsActive() != null && staff.getIsActive())
                .collect(java.util.stream.Collectors.toList());
        
        if (onlineStaff.isEmpty()) {
            log.warn("⚠️ No ONLINE staff found");
            return null;
        }
        
        log.info("📊 Found {} online staff", onlineStaff.size());
        
        // Find online staff with minimum customer count (load balancing)
        UserEntity selectedStaff = null;
        long minCustomers = Long.MAX_VALUE;
        
        for (UserEntity staff : onlineStaff) {
            long customerCount = assignmentRepository.countActiveByStaffId(staff.getUserId());
            log.debug("   Staff {} (ONLINE) has {} active customers", staff.getUserId(), customerCount);
            
            if (customerCount < minCustomers) {
                minCustomers = customerCount;
                selectedStaff = staff;
            }
        }
        
        log.info("✅ Selected ONLINE staff {} with {} customers (least loaded)", 
                selectedStaff != null ? selectedStaff.getUserId() : "null", minCustomers);
        
        return selectedStaff;
    }
    
    /**
     * Enrich assignment response với thông tin bổ sung
     */
    private void enrichAssignmentResponse(MessageAssignmentResponse response) {
        // Đếm số tin nhắn chưa đọc
        long unreadCount = messageRepository.countUnreadInConversation(
            response.getCustomerId(), 
            response.getAssignedStaffId()
        );
        response.setUnreadMessageCount(unreadCount);
        
        // Lấy tin nhắn gần nhất
        MessageEntity lastMessage = messageRepository.findLastMessage(
            response.getCustomerId(), 
            response.getAssignedStaffId()
        );
        if (lastMessage != null) {
            response.setLastMessageAt(lastMessage.getSentAt());
        }
    }
}

