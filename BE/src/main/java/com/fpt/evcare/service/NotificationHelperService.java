package com.fpt.evcare.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * Helper service để gửi notifications metrics WebSocket
 * Injection SimpMessagingTemplate để tránh circular dependency với Controllers
 */
@Slf4j
@Service
public class NotificationHelperService {
    
    private final SimpMessagingTemplate messagingTemplate;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    
    public NotificationHelperService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }
    
    /**
     * Gửi notification qua WebSocket
     */
    public void sendNotification(UUID userId, NotificationData notificationData) {
        try {
            log.info("📬 Sending notification to user: {}", userId);
            log.info("📬 Notification: {}", notificationData);
            
            messagingTemplate.convertAndSendToUser(
                    userId.toString(),
                    "/queue/notifications",
                    notificationData
            );
            
            log.info("✅ Notification sent successfully to user: {}", userId);
        } catch (Exception e) {
            log.error("❌ Error sending notification to user {}: {}", userId, e.getMessage(), e);
        }
    }
    
    /**
     * Inner class để đóng gói notification data
     */
    public static class NotificationData {
        private String notificationId;
        private String title;
        private String content;
        private String notificationType;
        private Long unreadCount;
        private String sentAt;
        private String appointmentId;
        private String messageId;
        private String maintenanceManagementId;
        private String invoiceId;
        
        public NotificationData() {
            this.notificationId = UUID.randomUUID().toString();
            this.sentAt = LocalDateTime.now().format(FORMATTER);
        }
        
        // Getters and Setters
        public String getNotificationId() { return notificationId; }
        public void setNotificationId(String notificationId) { this.notificationId = notificationId; }
        
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        
        public String getNotificationType() { return notificationType; }
        public void setNotificationType(String notificationType) { this.notificationType = notificationType; }
        
        public Long getUnreadCount() { return unreadCount; }
        public void setUnreadCount(Long unreadCount) { this.unreadCount = unreadCount; }
        
        public String getSentAt() { return sentAt; }
        public void setSentAt(String sentAt) { this.sentAt = sentAt; }
        
        public String getAppointmentId() { return appointmentId; }
        public void setAppointmentId(String appointmentId) { this.appointmentId = appointmentId; }
        
        public String getMessageId() { return messageId; }
        public void setMessageId(String messageId) { this.messageId = messageId; }
        
        public String getMaintenanceManagementId() { return maintenanceManagementId; }
        public void setMaintenanceManagementId(String maintenanceManagementId) { this.maintenanceManagementId = maintenanceManagementId; }
        
        public String getInvoiceId() { return invoiceId; }
        public void setInvoiceId(String invoiceId) { this.invoiceId = invoiceId; }
        
        @Override
        public String toString() {
            return "NotificationData{" +
                    "notificationId='" + notificationId + '\'' +
                    ", title='" + title + '\'' +
                    ", content='" + content + '\'' +
                    ", notificationType='" + notificationType + '\'' +
                    ", unreadCount=" + unreadCount +
                    ", sentAt='" + sentAt + '\'' +
                    '}';
        }
    }
}

