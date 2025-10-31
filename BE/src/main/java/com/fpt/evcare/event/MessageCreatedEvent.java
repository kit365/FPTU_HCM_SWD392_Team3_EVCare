package com.fpt.evcare.event;

import com.fpt.evcare.dto.response.MessageResponse;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Event được publish khi có tin nhắn mới được tạo
 * EventListener sẽ bắt event này và gửi qua WebSocket
 */
@Getter
public class MessageCreatedEvent extends ApplicationEvent {
    
    private final MessageResponse message;
    
    public MessageCreatedEvent(Object source, MessageResponse message) {
        super(source);
        this.message = message;
    }
}

