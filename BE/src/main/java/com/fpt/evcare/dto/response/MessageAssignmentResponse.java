package com.fpt.evcare.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MessageAssignmentResponse {
    
    UUID assignmentId;
    
    // Customer info
    UUID customerId;
    String customerName;
    String customerEmail;
    String customerAvatarUrl;
    Boolean customerIsActive; // Trạng thái online/offline của customer
    
    // Assigned staff info
    UUID assignedStaffId;
    String assignedStaffName;
    String assignedStaffEmail;
    String assignedStaffAvatarUrl;
    Boolean assignedStaffIsActive; // Trạng thái online/offline của staff
    
    // Assignment info
    String assignedByName;
    LocalDateTime assignedAt;
    Boolean isActive;
    String notes;
    
    // Extra info
    Long unreadMessageCount; // Số tin nhắn chưa đọc
    LocalDateTime lastMessageAt; // Thời gian tin nhắn gần nhất
}

