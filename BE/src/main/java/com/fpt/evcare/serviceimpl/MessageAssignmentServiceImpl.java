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
import com.fpt.evcare.enums.MessageStatusEnum;
import com.fpt.evcare.enums.RoleEnum;
import com.fpt.evcare.event.MessageCreatedEvent;
import com.fpt.evcare.exception.ResourceNotFoundException;
import com.fpt.evcare.exception.UserValidationException;
import com.fpt.evcare.mapper.MessageAssignmentMapper;
import com.fpt.evcare.mapper.MessageMapper;
import com.fpt.evcare.mapper.UserMapper;
import com.fpt.evcare.repository.MessageAssignmentRepository;
import com.fpt.evcare.repository.MessageRepository;
import com.fpt.evcare.repository.UserRepository;
import com.fpt.evcare.service.MessageAssignmentService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.user.SimpUser;
import org.springframework.messaging.simp.user.SimpUserRegistry;
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
    MessageMapper messageMapper;
    UserMapper userMapper;
    ApplicationEventPublisher eventPublisher;
    SimpUserRegistry simpUserRegistry; // Để check WebSocket session thực tế
    
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
        
        // Kiểm tra xem customer đã có assignment chưa (bất kể is_active)
        Optional<MessageAssignmentEntity> existingAny = 
            assignmentRepository.findByCustomerId(request.getCustomerId());
        
        MessageAssignmentEntity savedAssignment;
        
        if (existingAny.isPresent()) {
            MessageAssignmentEntity existing = existingAny.get();
            
            // Nếu assign cho cùng 1 staff -> UPDATE assignment hiện có (set isActive = true)
            if (existing.getAssignedStaff().getUserId().equals(request.getStaffId())) {
                log.info("Customer {} already assigned to staff {}, updating assignment", 
                    request.getCustomerId(), request.getStaffId());
                
                existing.setIsActive(true);
                existing.setAssignedBy(admin);
                existing.setNotes(request.getNotes());
                existing.setUpdatedBy(admin.getFullName());
                
                savedAssignment = assignmentRepository.save(existing);
            } else {
                // Nếu assign cho staff khác -> UPDATE assignment hiện có (thay đổi staff)
                log.info(MessageConstants.LOG_SUCCESS_REASSIGN, 
                    request.getCustomerId(), 
                    existing.getAssignedStaff().getUserId(), 
                    request.getStaffId());
                
                existing.setAssignedStaff(staff);
                existing.setAssignedBy(admin);
                existing.setIsActive(true);
                existing.setNotes(request.getNotes());
                existing.setUpdatedBy(admin.getFullName());
                // assignedAt không thể update (updatable = false), giữ nguyên thời gian tạo ban đầu
                
                savedAssignment = assignmentRepository.save(existing);
            }
            
            log.info(MessageConstants.LOG_SUCCESS_ASSIGN, request.getCustomerId(), request.getStaffId());
        } else {
            // Chưa có assignment -> tạo mới
            MessageAssignmentEntity assignment = MessageAssignmentEntity.builder()
                    .customer(customer)
                    .assignedStaff(staff)
                    .assignedBy(admin)
                    .notes(request.getNotes())
                    .createdBy(admin.getFullName())
                    .updatedBy(admin.getFullName())
                    .build();
            
            savedAssignment = assignmentRepository.save(assignment);
            log.info(MessageConstants.LOG_SUCCESS_ASSIGN, request.getCustomerId(), request.getStaffId());
        }
        
        // Force initialization of lazy-loaded relationships
        initializeAssignmentRelations(savedAssignment);
        
        MessageAssignmentResponse response = assignmentMapper.toResponse(savedAssignment);
        enrichAssignmentResponse(response);
        return response;
    }
    
    @Override
    @Transactional(readOnly = true)
    public MessageAssignmentResponse getAssignmentByCustomerId(UUID customerId) {
        Optional<MessageAssignmentEntity> assignment = 
            assignmentRepository.findActiveByCustomerId(customerId);
        
        if (assignment.isEmpty()) {
            log.warn(MessageConstants.LOG_ERR_NO_ASSIGNMENT, customerId);
            throw new ResourceNotFoundException(MessageConstants.MESSAGE_ERR_CUSTOMER_NOT_ASSIGNED);
        }
        
        // Force initialization of lazy-loaded relationships
        initializeAssignmentRelations(assignment.get());
        
        MessageAssignmentResponse response = assignmentMapper.toResponse(assignment.get());
        enrichAssignmentResponse(response);
        return response;
    }
    
    @Override
    @Transactional(readOnly = true)
    public PageResponse<MessageAssignmentResponse> getAssignmentsByStaffId(UUID staffId, Pageable pageable) {
        Page<MessageAssignmentEntity> assignmentPage = 
            assignmentRepository.findAllByStaffId(staffId, pageable);
        
        // Force initialization of lazy-loaded relationships before mapping
        assignmentPage.getContent().forEach(this::initializeAssignmentRelations);
        
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
    @Transactional(readOnly = true)
    public PageResponse<MessageAssignmentResponse> getAllAssignments(Pageable pageable) {
        Page<MessageAssignmentEntity> assignmentPage = assignmentRepository.findAllActive(pageable);
        
        // Force initialization of lazy-loaded relationships before mapping
        assignmentPage.getContent().forEach(this::initializeAssignmentRelations);
        
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
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> getUnassignedCustomers(Pageable pageable) {
        Page<UserEntity> customerPage = assignmentRepository.findUnassignedCustomers(pageable);
        
        // Force initialization of lazy-loaded relationships (role) before mapping
        customerPage.getContent().forEach(user -> {
            if (user.getRole() != null) {
                user.getRole().getRoleName(); // Access to trigger loading
            }
        });
        
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
        
        // Find online staff with least customers (load balancing)
        UserEntity selectedStaff = findOnlineStaffWithLeastCustomers();
        
        if (selectedStaff == null) {
            throw new ResourceNotFoundException("Không tìm thấy staff online khả dụng");
        }
        
        // Check if customer already has assignment (bất kể is_active)
        Optional<MessageAssignmentEntity> existingAny = 
            assignmentRepository.findByCustomerId(customerId);
        
        MessageAssignmentEntity savedAssignment;
        
        MessageAssignmentEntity oldAssignment = null;
        UUID oldStaffId = null;
        
        if (existingAny.isPresent()) {
            MessageAssignmentEntity existing = existingAny.get();
            UserEntity currentStaff = existing.getAssignedStaff();
            oldStaffId = currentStaff.getUserId(); // Lưu staff cũ để check sau
            
            // Check if current staff is still online/active and same staff
            if (currentStaff.getIsActive() != null && currentStaff.getIsActive() 
                    && currentStaff.getUserId().equals(selectedStaff.getUserId())) {
                log.info("✅ Customer {} already assigned to ONLINE staff {}, keeping assignment", 
                        customerId, currentStaff.getUserId());
                MessageAssignmentResponse response = assignmentMapper.toResponse(existing);
                enrichAssignmentResponse(response);
                return response;
            }
            
            // Current staff is OFFLINE or different -> UPDATE assignment hiện có (không INSERT mới)
            log.warn("⚠️ Current staff {} is OFFLINE or different, reassigning customer {} to online staff {}", 
                    currentStaff.getUserId(), customerId, selectedStaff.getUserId());
            
            oldAssignment = existing; // Lưu để check sau
            
            // UPDATE assignment hiện có (tránh unique constraint violation)
            // Dùng entity management để update (JPA tự động xử lý relationship)
            existing.setAssignedStaff(selectedStaff);
            existing.setIsActive(true);
            existing.setUpdatedBy("SYSTEM");
            existing.setNotes("Auto-reassigned: staff offline");
            // assignedAt không thể update (updatable = false), giữ nguyên thời gian tạo ban đầu
            
            savedAssignment = assignmentRepository.save(existing);
            log.info("✅ Updated existing assignment for customer {} to online staff {}", 
                    customerId, selectedStaff.getUserId());
        } else {
            // Chưa có assignment -> tạo mới
            MessageAssignmentEntity assignment = MessageAssignmentEntity.builder()
                    .customer(customer)
                    .assignedStaff(selectedStaff)
                    .assignedBy(null)  // Auto-assigned by system
                    .notes("Auto-assigned by system")
                    .createdBy("SYSTEM")
                    .updatedBy("SYSTEM")
                    .build();
            
            savedAssignment = assignmentRepository.save(assignment);
            log.info("✅ Created new assignment for customer {} to online staff {}", 
                    customerId, selectedStaff.getUserId());
        }
        
        String action = existingAny.isPresent() ? "reassigned" : "assigned";
        log.info("✅ Auto-{} customer {} to online staff {} (least loaded)", 
                action, customerId, selectedStaff.getUserId());
        
        // Tạo tin nhắn tự động chào mừng từ staff mới đến customer
        // CHỈ gửi khi: 
        // 1. First assign (chưa có assignment) - oldStaffId == null
        // 2. Reassign sang staff KHÁC (staff cũ != staff mới) - oldStaffId != null && oldStaffId != selectedStaff.getUserId()
        // KHÔNG gửi khi: 
        // - Staff không thay đổi (oldStaffId == selectedStaff.getUserId())
        // - Đã có welcome message từ staff này trong vòng 5 phút gần đây (tránh spam khi polling)
        boolean shouldSendWelcomeMessage = false;
        String welcomeMessage = "";
        
        if (oldStaffId == null) {
            // First assign - kiểm tra xem đã có welcome message từ staff này gần đây chưa
            List<MessageEntity> recentWelcomes = messageRepository.findRecentWelcomeMessages(
                    selectedStaff.getUserId(), 
                    customerId, 
                    LocalDateTime.now().minusMinutes(5),
                    org.springframework.data.domain.PageRequest.of(0, 1)
            );
            
            if (recentWelcomes == null || recentWelcomes.isEmpty()) {
                // Chưa có welcome message gần đây -> gửi
                shouldSendWelcomeMessage = true;
                welcomeMessage = "Cảm ơn bạn đã liên hệ với EVCare! Chúng tôi rất vui được hỗ trợ bạn. Vui lòng cho chúng tôi biết bạn cần hỗ trợ gì?";
            } else {
                log.debug("⏭️ Skipping welcome message (already sent recently from staff {} to customer {})", 
                        selectedStaff.getUserId(), customerId);
            }
        } else if (!oldStaffId.equals(selectedStaff.getUserId())) {
            // Reassign sang staff KHÁC - kiểm tra xem đã có welcome message từ staff mới này gần đây chưa
            List<MessageEntity> recentWelcomes = messageRepository.findRecentWelcomeMessages(
                    selectedStaff.getUserId(), 
                    customerId, 
                    LocalDateTime.now().minusMinutes(5),
                    org.springframework.data.domain.PageRequest.of(0, 1)
            );
            
            if (recentWelcomes == null || recentWelcomes.isEmpty()) {
                // Chưa có welcome message từ staff mới gần đây -> gửi
                shouldSendWelcomeMessage = true;
                welcomeMessage = "Cảm ơn bạn đã liên hệ! Chúng tôi đã chuyển bạn sang nhân viên khác để được hỗ trợ tốt hơn. Chúng tôi sẵn sàng hỗ trợ bạn!";
            } else {
                log.debug("⏭️ Skipping welcome message (already sent recently from new staff {} to customer {})", 
                        selectedStaff.getUserId(), customerId);
            }
        }
        // Nếu oldStaffId != null && oldStaffId == selectedStaff.getUserId() -> KHÔNG gửi (tránh spam)
        
        // Chỉ gửi tin nhắn chào mừng khi cần (first assign hoặc reassign thực sự)
        if (shouldSendWelcomeMessage) {
            MessageEntity welcomeMsg = MessageEntity.builder()
                    .sender(selectedStaff)
                    .receiver(customer)
                    .content(welcomeMessage)
                    .status(MessageStatusEnum.SENT)
                    .createdBy("SYSTEM")
                    .updatedBy("SYSTEM")
                    .build();
            
            MessageEntity savedWelcomeMsg = messageRepository.save(welcomeMsg);
            log.info("✅ Created welcome message from staff {} to customer {}", selectedStaff.getUserId(), customerId);
            
            // Gửi tin nhắn chào mừng qua WebSocket
            try {
                com.fpt.evcare.dto.response.MessageResponse welcomeMsgResponse = messageMapper.toResponse(savedWelcomeMsg);
                eventPublisher.publishEvent(new MessageCreatedEvent(this, welcomeMsgResponse));
                log.info("✅ Published welcome message event to WebSocket");
            } catch (Exception e) {
                log.error("❌ Failed to publish welcome message event: {}", e.getMessage());
                // Không throw exception, vì assignment đã thành công
            }
        } else {
            log.debug("⏭️ Skipping welcome message (same staff or not needed)");
        }
        
        // Force initialization of lazy-loaded relationships
        initializeAssignmentRelations(savedAssignment);
        
        MessageAssignmentResponse response = assignmentMapper.toResponse(savedAssignment);
        enrichAssignmentResponse(response);
        return response;
    }
    
    /**
     * Find ONLINE STAFF with least customers (load balancing)
     * CHỈ lấy STAFF, KHÔNG lấy ADMIN (vì admin không nhắn tin với customer)
     * CHỈ lấy STAFF có WebSocket session ACTIVE (không chỉ dựa vào isActive trong DB)
     */
    private UserEntity findOnlineStaffWithLeastCustomers() {
        // Get all STAFF only (not ADMIN)
        List<UserEntity> allStaff = userRepository.findByRoleNameAndIsDeletedFalse(RoleEnum.STAFF);
        
        // Filter chỉ STAFF có WebSocket session ACTIVE (check qua SimpUserRegistry)
        List<UserEntity> onlineStaff = allStaff.stream()
                .filter(staff -> {
                    // Check WebSocket session thực tế (không chỉ dựa vào DB isActive)
                    String userIdStr = staff.getUserId().toString();
                    SimpUser simpUser = simpUserRegistry.getUser(userIdStr);
                    
                    boolean hasActiveSession = simpUser != null && !simpUser.getSessions().isEmpty();
                    
                    if (!hasActiveSession) {
                        log.debug("   ⏭️ Staff {} ({} {}) has NO active WebSocket session - skipping", 
                                staff.getUserId(), staff.getFullName(), staff.getRole().getRoleName());
                        return false;
                    }
                    
                    // Có active WebSocket session -> OK
                    log.debug("   ✅ Staff {} ({} {}) has active WebSocket session", 
                            staff.getUserId(), staff.getFullName(), staff.getRole().getRoleName());
                    return true;
                })
                .collect(java.util.stream.Collectors.toList());
        
        if (onlineStaff.isEmpty()) {
            log.warn("⚠️ No STAFF with active WebSocket session found (admin is excluded)");
            return null;
        }
        
        log.info("📊 Found {} STAFF with active WebSocket sessions", onlineStaff.size());
        
        // Find STAFF with active WebSocket session and minimum customer count (load balancing)
        UserEntity selectedStaff = null;
        long minCustomers = Long.MAX_VALUE;
        
        for (UserEntity staff : onlineStaff) {
            long customerCount = assignmentRepository.countActiveByStaffId(staff.getUserId());
            log.info("   Staff {} ({} {}) (WebSocket ACTIVE) has {} active customers", 
                    staff.getUserId(), staff.getFullName(), staff.getRole().getRoleName(), customerCount);
            
            if (customerCount < minCustomers) {
                minCustomers = customerCount;
                selectedStaff = staff;
            }
        }
        
        if (selectedStaff != null) {
            log.info("✅ Selected STAFF {} ({} {}) with active WebSocket session and {} customers (least loaded)", 
                    selectedStaff.getUserId(), selectedStaff.getFullName(), 
                    selectedStaff.getRole().getRoleName(), minCustomers);
        } else {
            log.error("❌ No STAFF selected (should not happen)");
        }
        
        return selectedStaff;
    }
    
    /**
     * Helper method to force initialization of lazy-loaded assignment relationships
     * This must be called within an active transaction
     */
    private void initializeAssignmentRelations(MessageAssignmentEntity assignment) {
        if (assignment == null) {
            return;
        }
        
        // Initialize customer (UserEntity)
        if (assignment.getCustomer() != null) {
            assignment.getCustomer().getUserId(); // Access to trigger loading
            if (assignment.getCustomer().getRole() != null) {
                assignment.getCustomer().getRole().getRoleName(); // Load role if needed
            }
        }
        
        // Initialize assignedStaff (UserEntity)
        if (assignment.getAssignedStaff() != null) {
            assignment.getAssignedStaff().getUserId(); // Access to trigger loading
            if (assignment.getAssignedStaff().getRole() != null) {
                assignment.getAssignedStaff().getRole().getRoleName(); // Load role if needed
            }
        }
        
        // Initialize assignedBy (UserEntity) - may be null
        if (assignment.getAssignedBy() != null) {
            assignment.getAssignedBy().getUserId(); // Access to trigger loading
            if (assignment.getAssignedBy().getRole() != null) {
                assignment.getAssignedBy().getRole().getRoleName(); // Load role if needed
            }
        }
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

