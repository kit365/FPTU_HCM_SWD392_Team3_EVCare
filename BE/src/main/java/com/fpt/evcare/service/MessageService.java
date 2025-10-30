package com.fpt.evcare.service;

import com.fpt.evcare.dto.request.message.CreationMessageRequest;
import com.fpt.evcare.dto.response.MessageResponse;
import com.fpt.evcare.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface MessageService {
    MessageResponse sendMessage(UUID senderId, CreationMessageRequest request);
    MessageResponse getMessage(UUID messageId, UUID currentUserId);
    PageResponse<MessageResponse> getConversation(UUID currentUserId, UUID otherUserId, Pageable pageable);
    MessageResponse markAsRead(UUID messageId, UUID userId);
    int markConversationAsRead(UUID currentUserId, UUID otherUserId);
    MessageResponse markAsDelivered(UUID messageId, UUID userId);
    long countUnreadMessages(UUID userId);
    PageResponse<MessageResponse> getRecentConversations(UUID userId, Pageable pageable);
    void deleteMessage(UUID messageId, UUID currentUserId);
}

