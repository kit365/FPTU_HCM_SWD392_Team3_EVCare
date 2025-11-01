package com.fpt.evcare.event;

import com.fpt.evcare.dto.response.MessageResponse;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Event được publish khi status của message thay đổi (DELIVERED hoặc READ)
 * EventListener sẽ bắt event này và gửi qua WebSocket đến sender để update UI
 */
@Getter
public class MessageStatusUpdatedEvent extends ApplicationEvent {
    
    private final MessageResponse message;
    
    public MessageStatusUpdatedEvent(Object source, MessageResponse message) {
        super(source);
        this.message = message;
    }
}

