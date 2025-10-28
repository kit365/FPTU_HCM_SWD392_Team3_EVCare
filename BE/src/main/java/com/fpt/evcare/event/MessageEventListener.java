package com.fpt.evcare.event;

import com.fpt.evcare.service.MessageService;
import jakarta.annotation.Nonnull;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Event Listener để xử lý MessageCreatedEvent
 * Khi có tin nhắn mới được tạo, listener sẽ gửi qua WebSocket
 */
@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MessageEventListener implements ApplicationListener<MessageCreatedEvent> {
    
    SimpMessagingTemplate messagingTemplate;
    MessageService messageService;
    
    @Override
    @Async
    public void onApplicationEvent(@Nonnull MessageCreatedEvent event) {
        log.info("🎉 ====== MESSAGE CREATED EVENT RECEIVED ======");
        log.info("🎉 Sender: {}", event.getSenderId());
        log.info("🎉 Receiver: {}", event.getReceiverId());
        log.info("🎉 Message ID: {}", event.getMessageResponse().getMessageId());
        
        try {
            String senderId = event.getSenderId();
            String receiverId = event.getReceiverId();
            var messageResponse = event.getMessageResponse();
            
            // Send to sender (confirmation)
            log.info("📤 Sending confirmation to sender {} at /user/{}/queue/messages", senderId, senderId);
            messagingTemplate.convertAndSendToUser(
                    senderId,
                    "/queue/messages",
                    messageResponse
            );
            log.info("✅ Confirmation sent to sender successfully");
            
            // Send to receiver (new message)
            log.info("📤 Sending new message to receiver {} at /user/{}/queue/messages", receiverId, receiverId);
            messagingTemplate.convertAndSendToUser(
                    receiverId,
                    "/queue/messages",
                    messageResponse
            );
            log.info("✅ New message sent to receiver successfully");
            
            // Send unread count update to receiver
            Long unreadCount = messageService.getUnreadCount(UUID.fromString(receiverId));
            log.info("📊 Sending unread count ({}) to receiver {}", unreadCount, receiverId);
            messagingTemplate.convertAndSendToUser(
                    receiverId,
                    "/queue/unread-count",
                    unreadCount
            );
            log.info("✅ Unread count sent successfully");
            
        } catch (Exception e) {
            log.error("❌ Error processing MessageCreatedEvent: {}", e.getMessage(), e);
        }
    }
}

