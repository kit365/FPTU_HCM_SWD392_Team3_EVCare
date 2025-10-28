package com.fpt.evcare.service;

import com.fpt.evcare.dto.request.message.CreationMessageRequest;
import com.fpt.evcare.dto.response.MessageResponse;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.dto.response.UserResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface MessageService {
    MessageResponse sendMessage(UUID senderId, CreationMessageRequest request);
    MessageResponse getMessage(UUID messageId, UUID currentUserId);
    PageResponse<MessageResponse> getConversation(UUID currentUserId, UUID otherUserId, Pageable pageable);
    boolean markMessageAsRead(UUID messageId, UUID userId);
    Long getUnreadCount(UUID userId);
    boolean deleteMessage(UUID messageId, UUID userId);
    PageResponse<MessageResponse> getAllMessages(UUID userId, Pageable pageable);
    List<UserResponse> getAvailableStaff();
}


