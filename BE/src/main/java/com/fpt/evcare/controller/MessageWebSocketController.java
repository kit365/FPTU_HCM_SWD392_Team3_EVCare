package com.fpt.evcare.controller;

import com.fpt.evcare.constants.MessageConstants;
import com.fpt.evcare.dto.request.message.CreationMessageRequest;
import com.fpt.evcare.dto.response.MessageResponse;
import com.fpt.evcare.service.MessageService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.UUID;

/**
 * WebSocket Controller cho real-time messaging
 * 
 * Endpoints:
 * - /app/message/send -> Gửi tin nhắn real-time
 * - /app/message/mark-delivered -> Đánh dấu đã nhận
 * - /app/message/mark-read -> Đánh dấu đã đọc
 * - /app/message/typing -> Thông báo đang typing (future)
 * 
 * Subscriptions:
 * - /user/{userId}/queue/messages -> Nhận tin nhắn mới
 * - /user/{userId}/queue/typing -> Nhận typing status (future)
 */
@Slf4j
@Controller
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MessageWebSocketController {
    
    MessageService messageService;
    SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/message/send")
    public void sendMessage(@Payload CreationMessageRequest request) {
        // Lấy senderId từ request payload (FE đã gửi)
        UUID senderId = request.getSenderId();
        if (senderId == null) {
            log.error("❌ WS message: senderId is null in request");
            return;
        }
        
        log.info("💬 WS message: sender={} → receiver={}", senderId, request.getReceiverId());
        messageService.sendMessage(senderId, request);
    }
    
    /**
     * Đánh dấu tin nhắn đã nhận (DELIVERED)
     * Client gửi đến: /app/message/mark-delivered
     */
//    @MessageMapping("/message/mark-delivered")
//    public void markAsDelivered(@Payload Map<String, String> payload, Principal principal) {
//        try {
//            UUID messageId = UUID.fromString(payload.get("messageId"));
//            UUID userId = UUID.fromString(principal.getName());
//
//            log.info("✓ WebSocket: Mark as delivered - Message: {}, User: {}", messageId, userId);
//
//            MessageResponse response = messageService.markAsDelivered(messageId, userId);
//
//            // Gửi update về cho sender để update UI (hiện ✓)
//            String destination = MessageConstants.WS_TOPIC_USER_MESSAGES
//                    .replace("{userId}", response.getSenderId().toString());
//
//            messagingTemplate.convertAndSend(destination, Map.of(
//                "type", "status_update",
//                "messageId", response.getMessageId(),
//                "status", "DELIVERED",
//                "deliveredAt", response.getDeliveredAt()
//            ));
//
//            log.info("✅ WebSocket: Marked as delivered and notified sender");
//
//        } catch (Exception e) {
//            log.error("❌ WebSocket: Error marking as delivered: {}", e.getMessage(), e);
//        }
//    }
//
//    /**
//     * Đánh dấu tin nhắn đã đọc (READ)
//     * Client gửi đến: /app/message/mark-read
//     */
//    @MessageMapping("/message/mark-read")
//    public void markAsRead(@Payload Map<String, String> payload, Principal principal) {
//        try {
//            UUID messageId = UUID.fromString(payload.get("messageId"));
//            UUID userId = UUID.fromString(principal.getName());
//
//            log.info("✓✓ WebSocket: Mark as read - Message: {}, User: {}", messageId, userId);
//
//            // Mark as read using service
//            MessageResponse response = messageService.markAsRead(messageId, userId);
//
//            // Gửi update về cho sender để update UI (hiện ✓✓)
//            String destination = MessageConstants.WS_TOPIC_USER_MESSAGES
//                    .replace("{userId}", response.getSenderId().toString());
//
//            messagingTemplate.convertAndSend(destination, Map.of(
//                "type", "status_update",
//                "messageId", response.getMessageId(),
//                "status", "READ",
//                "readAt", response.getReadAt()
//            ));
//
//            log.info("✅ WebSocket: Marked as read and notified sender");
//
//        } catch (Exception e) {
//            log.error("❌ WebSocket: Error marking as read: {}", e.getMessage(), e);
//        }
//    }
//
//    /**
//     * Typing indicator (future feature)
//     * Client gửi đến: /app/message/typing
//     */
//    @MessageMapping("/message/typing")
//    public void sendTypingIndicator(@Payload Map<String, String> payload, Principal principal) {
//        try {
//            UUID receiverId = UUID.fromString(payload.get("receiverId"));
//            boolean isTyping = Boolean.parseBoolean(payload.getOrDefault("isTyping", "true"));
//
//            log.info("⌨️ WebSocket: Typing indicator from {} to {}: {}", principal.getName(), receiverId, isTyping);
//
//            // Gửi typing indicator đến receiver
//            String destination = MessageConstants.WS_TOPIC_USER_TYPING
//                    .replace("{userId}", receiverId.toString());
//
//            messagingTemplate.convertAndSend(destination, Map.of(
//                "senderId", principal.getName(),
//                "isTyping", isTyping
//            ));
//
//        } catch (Exception e) {
//            log.error("❌ WebSocket: Error sending typing indicator: {}", e.getMessage());
//        }
//    }
}

