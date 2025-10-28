package com.fpt.evcare.controller;

import com.fpt.evcare.dto.request.message.CreationMessageRequest;
import com.fpt.evcare.dto.response.MessageResponse;
import com.fpt.evcare.service.MessageService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Slf4j
@Controller
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MessageWebSocketController {

    MessageService messageService;
    SimpMessagingTemplate messagingTemplate;

    /**
     * Client subscribe: /user/{userId}/queue/messages
     * Client gửi tin nhắn đến: /app/message/send
     * Server tự động forward đến: /user/{receiverId}/queue/messages
     */
    @MessageMapping("/message/send")
    public void handleSendMessage(
            @Payload MessageRequest messageRequest) {

        log.info("🔥 ====== RECEIVED WebSocket MESSAGE ======");
        log.info("🔥 Raw MessageRequest: senderId={}, receiverId={}, content={}",
                messageRequest.getSenderId(), messageRequest.getReceiverId(), messageRequest.getContent());

        try {
            // Validate và gửi tin nhắn
            MessageResponse response = messageService.sendMessage(
                    messageRequest.getSenderId(),
                    new CreationMessageRequest(
                            messageRequest.getReceiverId(),
                            messageRequest.getContent(),
                            messageRequest.getAttachmentUrl()
                    )
            );

            log.info("✅ Message saved successfully, response ID: {}", response.getMessageId());
            log.info("Gửi tin nhắn qua WebSocket từ {} đến {}", messageRequest.getSenderId(), messageRequest.getReceiverId());
            log.info("Message response object: {}", response);

            // Gửi tin nhắn đến sender (xác nhận gửi thành công)
            log.info("Sending to sender {} at /queue/messages", messageRequest.getSenderId());
            messagingTemplate.convertAndSendToUser(
                    messageRequest.getSenderId().toString(),
                    "/queue/messages",
                    response
            );

            // Gửi tin nhắn đến receiver (tin nhắn mới)
            log.info("Sending to receiver {} at /queue/messages", messageRequest.getReceiverId());
            log.info("Message content being sent: {}", response.getContent());
            messagingTemplate.convertAndSendToUser(
                    messageRequest.getReceiverId().toString(),
                    "/queue/messages",
                    response
            );

            // Gửi notification về số tin nhắn chưa đọc
            Long unreadCount = messageService.getUnreadCount(messageRequest.getReceiverId());
            log.info("Sending unread count {} to receiver {}", unreadCount, messageRequest.getReceiverId());
            messagingTemplate.convertAndSendToUser(
                    messageRequest.getReceiverId().toString(),
                    "/queue/unread-count",
                    unreadCount
            );

        } catch (Exception e) {
            log.error("Lỗi khi gửi tin nhắn qua WebSocket: {}", e.getMessage(), e);
            // Gửi error message về sender
            messagingTemplate.convertAndSendToUser(
                    messageRequest.getSenderId().toString(),
                    "/queue/errors",
                    "Lỗi khi gửi tin nhắn: " + e.getMessage()
            );
        }
    }

    /**
     * Client subscribe: /user/{userId}/queue/unread-count
     * Server gửi updates khi có tin nhắn mới
     */
    @MessageMapping("/message/mark-read")
    public void handleMarkAsRead(@Payload MarkReadRequest request) {
        try {
            messageService.markMessageAsRead(request.getMessageId(), request.getUserId());
            
            log.info("Đánh dấu tin nhắn {} đã đọc qua WebSocket", request.getMessageId());

            // Notify sender rằng receiver đã đọc tin nhắn
            // Có thể lấy senderId từ messageId
            // messagingTemplate.convertAndSendToUser(senderId, "/queue/message-read", messageId);
            
        } catch (Exception e) {
            log.error("Lỗi khi đánh dấu tin nhắn đã đọc qua WebSocket: {}", e.getMessage(), e);
        }
    }

    /**
     * Test connection - Ping/Pong
     * Client subscribe: /topic/test
     * Client gửi: /app/test
     */
    @MessageMapping("/test")
    public void handleTest(@Payload String message) {
        log.info("Received test message from WebSocket: {}", message);
        try {
            // Broadcast đến tất cả clients subscribe /topic/test
            String response = "✅ Server received: " + message + " | Time: " + java.time.LocalDateTime.now();
            messagingTemplate.convertAndSend("/topic/test", response);
            log.info("Sent response to /topic/test: {}", response);
        } catch (Exception e) {
            log.error("Error sending test message: {}", e.getMessage(), e);
        }
    }

    // ========== DTOs cho WebSocket ==========
    
    static class MessageRequest {
        UUID senderId;
        UUID receiverId;
        String content;
        String attachmentUrl;

        public UUID getSenderId() { return senderId; }
        public void setSenderId(UUID senderId) { this.senderId = senderId; }
        
        public UUID getReceiverId() { return receiverId; }
        public void setReceiverId(UUID receiverId) { this.receiverId = receiverId; }
        
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        
        public String getAttachmentUrl() { return attachmentUrl; }
        public void setAttachmentUrl(String attachmentUrl) { this.attachmentUrl = attachmentUrl; }
    }

    static class MarkReadRequest {
        UUID messageId;
        UUID userId;

        public UUID getMessageId() { return messageId; }
        public void setMessageId(UUID messageId) { this.messageId = messageId; }

        public UUID getUserId() { return userId; }
        public void setUserId(UUID userId) { this.userId = userId; }
    }
}

