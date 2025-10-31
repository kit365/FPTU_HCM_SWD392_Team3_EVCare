package com.fpt.evcare.dto.response;

import com.fpt.evcare.enums.MessageStatusEnum;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MessageResponse {
    
    UUID messageId;
    
    // Sender info
    UUID senderId;
    String senderName;
    String senderAvatarUrl;
    
    // Receiver info
    UUID receiverId;
    String receiverName;
    String receiverAvatarUrl;
    
    // Content
    String content;
    String imageUrl;
    
    // Status
    MessageStatusEnum status;
    
    // Timestamps
    LocalDateTime sentAt;
    LocalDateTime deliveredAt;
    LocalDateTime readAt;
    
    // Helper methods
    public boolean isRead() {
        return status == MessageStatusEnum.READ;
    }
    
    public boolean isDelivered() {
        return status == MessageStatusEnum.DELIVERED || status == MessageStatusEnum.READ;
    }
}

