package com.fpt.evcare.event;

import com.fpt.evcare.entity.MessageAssignmentEntity;
import com.fpt.evcare.entity.UserEntity;
import com.fpt.evcare.enums.RoleEnum;
import com.fpt.evcare.repository.MessageAssignmentRepository;
import com.fpt.evcare.repository.UserRepository;
import com.fpt.evcare.service.MessageAssignmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

/**
 * EventListener để track online/offline status của staff
 * Khi staff connect WebSocket → set isActive = true
 * Khi staff disconnect WebSocket → set isActive = false
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final UserRepository userRepository;
    private final MessageAssignmentRepository assignmentRepository;
    private final MessageAssignmentService messageAssignmentService;

  
    @EventListener
    public void handleSessionConnected(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal principal = headerAccessor.getUser();
        
        if (principal == null) {
            return;
        }

        try {
            UUID userId = UUID.fromString(principal.getName());
            UserEntity user = userRepository.findByUserIdAndIsDeletedFalse(userId);
            
            if (user == null) {
                log.warn("⚠️ User {} not found when connecting WebSocket", userId);
                return;
            }

            // Update online status cho tất cả users (STAFF, ADMIN, CUSTOMER)
            if (user.getIsActive() == null || !user.getIsActive()) {
                user.setIsActive(true);
                user.setUpdatedBy("SYSTEM");
                userRepository.save(user);
                
                if (user.getRole().getRoleName() == RoleEnum.STAFF || user.getRole().getRoleName() == RoleEnum.ADMIN) {
                    log.info("✅ Staff {} ({} {}) is now ONLINE", 
                            user.getUserId(), user.getFullName(), user.getRole().getRoleName());
                } else if (user.getRole().getRoleName() == RoleEnum.CUSTOMER) {
                    log.info("✅ Customer {} ({}) is now ONLINE", 
                            user.getUserId(), user.getFullName());
                }
            } else {
                log.debug("User {} already marked as ONLINE", user.getUserId());
            }
        } catch (Exception e) {
            log.error("❌ Error updating online status for user {}: {}", 
                    principal.getName(), e.getMessage(), e);
        }
    }

    /**
     * Khi user disconnect WebSocket → set isActive = false (nếu là STAFF/ADMIN)
     */
    @EventListener
    public void handleSessionDisconnected(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal principal = headerAccessor.getUser();
        
        if (principal == null) {
            return;
        }

        try {
            UUID userId = UUID.fromString(principal.getName());
            UserEntity user = userRepository.findByUserIdAndIsDeletedFalse(userId);
            
            if (user == null) {
                log.warn("⚠️ User {} not found when disconnecting WebSocket", userId);
                return;
            }

            // Update offline status cho tất cả users (STAFF, ADMIN, CUSTOMER)
            if (user.getIsActive() == null || user.getIsActive()) {
                user.setIsActive(false);
                user.setUpdatedBy("SYSTEM");
                userRepository.save(user);
                
                if (user.getRole().getRoleName() == RoleEnum.STAFF || user.getRole().getRoleName() == RoleEnum.ADMIN) {
                    log.info("⚠️ Staff {} ({} {}) is now OFFLINE", 
                            user.getUserId(), user.getFullName(), user.getRole().getRoleName());
                    
                    // Tự động reassign tất cả customers của staff này sang staff online khác
                    reassignCustomersOfOfflineStaff(user.getUserId());
                } else if (user.getRole().getRoleName() == RoleEnum.CUSTOMER) {
                    log.info("⚠️ Customer {} ({}) is now OFFLINE", 
                            user.getUserId(), user.getFullName());
                }
            } else {
                log.debug("User {} already marked as OFFLINE", user.getUserId());
            }
        } catch (Exception e) {
            log.error("❌ Error updating offline status for user {}: {}", 
                    principal.getName(), e.getMessage(), e);
        }
    }
    
    /**
     * Reassign tất cả customers của staff offline sang staff online khác
     */
    @Transactional
    private void reassignCustomersOfOfflineStaff(UUID offlineStaffId) {
        try {
            // Lấy tất cả active assignments của staff này
            List<MessageAssignmentEntity> assignments = assignmentRepository.findAll()
                    .stream()
                    .filter(ma -> !ma.getIsDeleted() 
                            && ma.getIsActive() 
                            && ma.getAssignedStaff().getUserId().equals(offlineStaffId))
                    .toList();
            
            if (assignments.isEmpty()) {
                log.debug("No active assignments for offline staff {}", offlineStaffId);
                return;
            }
            
            log.info("🔄 Reassigning {} customers from offline staff {} to online staff", 
                    assignments.size(), offlineStaffId);
            
            // Reassign từng customer
            for (MessageAssignmentEntity assignment : assignments) {
                try {
                    UUID customerId = assignment.getCustomer().getUserId();
                    
                    // Gọi auto-assign để tự động chuyển sang staff online khác
                    messageAssignmentService.autoAssignCustomerToStaff(customerId);
                    
                    log.info("✅ Reassigned customer {} from offline staff {} to online staff", 
                            customerId, offlineStaffId);
                } catch (Exception e) {
                    log.error("❌ Failed to reassign customer {} from offline staff {}: {}", 
                            assignment.getCustomer().getUserId(), offlineStaffId, e.getMessage());
                    // Continue với customer tiếp theo
                }
            }
            
            log.info("✅ Completed reassigning customers from offline staff {}", offlineStaffId);
        } catch (Exception e) {
            log.error("❌ Error reassigning customers from offline staff {}: {}", 
                    offlineStaffId, e.getMessage(), e);
        }
    }
}

