package com.fpt.evcare.event;

import com.fpt.evcare.dto.response.MessageResponse;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Spring Event để thông báo khi có tin nhắn mới được tạo
 * Event listener sẽ handle việc gửi WebSocket message
 */
@Getter
public class MessageCreatedEvent extends ApplicationEvent {
    
    private final MessageResponse messageResponse;
    private final String senderId;
    private final String receiverId;
    
    public MessageCreatedEvent(Object source, MessageResponse messageResponse, String senderId, String receiverId) {
        super(source);
        this.messageResponse = messageResponse;
        this.senderId = senderId;
        this.receiverId = receiverId;
    }
}

