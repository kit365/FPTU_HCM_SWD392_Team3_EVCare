package com.fpt.evcare.event;

import com.fpt.evcare.constants.MessageConstants;
import com.fpt.evcare.dto.response.MessageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class MessageEventListener {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Khi có tin nhắn mới, gửi đến receiver qua WebSocket
     */
    @EventListener
    public void handleMessageCreatedEvent(MessageCreatedEvent event) {
        MessageResponse message = event.getMessage();
        try {
            // Send to receiver
            messagingTemplate.convertAndSendToUser(
                    message.getReceiverId().toString(),
                    MessageConstants.WS_TOPIC_USER_MESSAGES, 
                    message
            );
            
            // Echo back to sender (for UI sync)
            messagingTemplate.convertAndSendToUser(
                    message.getSenderId().toString(),
                    MessageConstants.WS_TOPIC_USER_MESSAGES, 
                    message
            );

            log.info("✅ Sent message: {} → {} (echoed to both)", 
                    message.getSenderName(), message.getReceiverName());
        } catch (Exception e) {
            log.error("❌ Failed to send WebSocket message", e);
        }
    }

    /**
     * Khi status của message thay đổi (DELIVERED hoặc READ), gửi update qua WebSocket đến sender
     */
    @EventListener
    public void handleMessageStatusUpdatedEvent(MessageStatusUpdatedEvent event) {
        MessageResponse message = event.getMessage();
        try {
            // Gửi status update đến sender để update UI (hiện ✓ hoặc ✓✓)
            messagingTemplate.convertAndSendToUser(
                    message.getSenderId().toString(),
                    MessageConstants.WS_TOPIC_USER_MESSAGES,
                    message
            );

            log.info("✅ Sent status update: Message {} is now {} (sent to sender {})", 
                    message.getMessageId(), message.getStatus(), message.getSenderId());
        } catch (Exception e) {
            log.error("❌ Failed to send status update via WebSocket", e);
        }
    }
}
