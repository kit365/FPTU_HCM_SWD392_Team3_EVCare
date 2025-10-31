package com.fpt.evcare.serviceimpl;
import com.fpt.evcare.constants.MessageConstants;
import com.fpt.evcare.constants.UserConstants;
import com.fpt.evcare.dto.request.message.CreationMessageRequest;
import com.fpt.evcare.dto.response.MessageResponse;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.entity.MessageAssignmentEntity;
import com.fpt.evcare.entity.MessageEntity;
import com.fpt.evcare.entity.UserEntity;
import com.fpt.evcare.enums.MessageStatusEnum;
import com.fpt.evcare.enums.RoleEnum;
import com.fpt.evcare.event.MessageCreatedEvent;
import com.fpt.evcare.event.MessageStatusUpdatedEvent;
import com.fpt.evcare.exception.ResourceNotFoundException;
import com.fpt.evcare.exception.UnauthorizedException;
import com.fpt.evcare.mapper.MessageMapper;
import com.fpt.evcare.repository.MessageAssignmentRepository;
import com.fpt.evcare.repository.MessageRepository;
import com.fpt.evcare.repository.UserRepository;
import com.fpt.evcare.service.MessageService;
import com.fpt.evcare.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MessageServiceImpl implements MessageService {
    
    MessageRepository messageRepository;
    UserRepository userRepository;
    MessageAssignmentRepository assignmentRepository;
    MessageMapper messageMapper;
    ApplicationEventPublisher eventPublisher;

    
    @Override
    @Transactional
    public MessageResponse sendMessage(UUID senderId, CreationMessageRequest request) {
        // Validate sender
        UserEntity sender = userRepository.findByUserIdAndIsDeletedFalse(senderId);
        if (sender == null) {
            log.warn(MessageConstants.LOG_ERR_MESSAGE_NOT_FOUND, senderId);
            throw new ResourceNotFoundException(MessageConstants.MESSAGE_ERR_SENDER_NOT_FOUND);
        }
        
        // Validate receiver
        UserEntity receiver = userRepository.findByUserIdAndIsDeletedFalse(request.getReceiverId());
        if (receiver == null) {
            log.warn(MessageConstants.LOG_ERR_MESSAGE_NOT_FOUND, request.getReceiverId());
            throw new ResourceNotFoundException(MessageConstants.MESSAGE_ERR_RECEIVER_NOT_FOUND);
        }
        
        // Không thể gửi tin nhắn cho chính mình
        if (senderId.equals(request.getReceiverId())) {
            log.warn("User {} tried to send message to themselves", senderId);
            throw new IllegalArgumentException(MessageConstants.MESSAGE_ERR_SEND_TO_SELF);
        }
        
        // Kiểm tra assignment nếu sender là CUSTOMER
        if (sender.getRole().getRoleName() == RoleEnum.CUSTOMER) {
            validateCustomerCanChat(senderId, request.getReceiverId());
        }
        
        // Kiểm tra assignment nếu receiver là CUSTOMER
        if (receiver.getRole().getRoleName() == RoleEnum.CUSTOMER) {
            validateCustomerCanChat(request.getReceiverId(), senderId);
        }
        
        // Validate content
        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException(MessageConstants.MESSAGE_ERR_EMPTY_CONTENT);
        }
        
        // Tạo message
        MessageEntity message = MessageEntity.builder()
                .sender(sender)
                .receiver(receiver)
                .content(request.getContent().trim())
                .imageUrl(request.getImageUrl())
                .status(MessageStatusEnum.SENT)
                .createdBy(sender.getFullName())
                .updatedBy(sender.getFullName())
                .build();
        
        MessageEntity savedMessage = messageRepository.save(message);
        log.info(MessageConstants.LOG_SUCCESS_SEND_MESSAGE, senderId, request.getReceiverId());
        

        MessageResponse response = messageMapper.toResponse(savedMessage);
        
        eventPublisher.publishEvent(new MessageCreatedEvent(this, response));
        
        return response;
    }
    
    /**
     * Validate customer chỉ được chat với staff được assign
     */
    private void validateCustomerCanChat(UUID customerId, UUID staffId) {
        Optional<MessageAssignmentEntity> assignment = 
            assignmentRepository.findActiveByCustomerId(customerId);
        
        if (assignment.isEmpty()) {
            log.warn(MessageConstants.LOG_ERR_NO_ASSIGNMENT, customerId);
            throw new UnauthorizedException(MessageConstants.MESSAGE_ERR_NO_ASSIGNMENT);
        }
        
        // Kiểm tra customer có được phép chat với staff này không
        if (!assignment.get().getAssignedStaff().getUserId().equals(staffId)) {
            log.warn("Customer {} tried to chat with unassigned staff {}", customerId, staffId);
            throw new UnauthorizedException(MessageConstants.MESSAGE_ERR_NO_ASSIGNMENT);
        }
    }
    
    @Override
    public MessageResponse getMessage(UUID messageId, UUID currentUserId) {
        MessageEntity message = messageRepository.findByMessageIdAndIsDeletedFalse(messageId);
        if (message == null) {
            log.warn(MessageConstants.LOG_ERR_MESSAGE_NOT_FOUND, messageId);
            throw new ResourceNotFoundException(MessageConstants.MESSAGE_ERR_NOT_FOUND);
        }
        
        // Check authorization
        boolean isSender = message.getSender().getUserId().equals(currentUserId);
        boolean isReceiver = message.getReceiver().getUserId().equals(currentUserId);
        
        if (!isSender && !isReceiver) {
            log.warn(MessageConstants.LOG_ERR_UNAUTHORIZED, currentUserId, messageId);
            throw new UnauthorizedException(MessageConstants.MESSAGE_ERR_UNAUTHORIZED);
        }
        
        return messageMapper.toResponse(message);
    }
    
    @Override
    public PageResponse<MessageResponse> getConversation(UUID currentUserId, UUID otherUserId, Pageable pageable) {
        UserEntity currentUser = userRepository.findByUserIdAndIsDeletedFalse(currentUserId);
        UserEntity otherUser = userRepository.findByUserIdAndIsDeletedFalse(otherUserId);
        
        if (currentUser == null || otherUser == null) {
            throw new ResourceNotFoundException(UserConstants.MESSAGE_ERR_USER_NOT_FOUND);
        }
        
        if (currentUser.getRole().getRoleName() == RoleEnum.CUSTOMER) {
            validateCustomerCanChat(currentUserId, otherUserId);
        }
        if (otherUser.getRole().getRoleName() == RoleEnum.CUSTOMER) {
            validateCustomerCanChat(otherUserId, currentUserId);
        }
        
        Page<MessageEntity> messagePage = messageRepository.findConversation(currentUserId, otherUserId, pageable);
        
        List<MessageResponse> messageResponses = messagePage.getContent().stream()
                .map(messageMapper::toResponse)
                .collect(Collectors.toList());
        
        return PageResponse.<MessageResponse>builder()
                .page(messagePage.getNumber())
                .size(messagePage.getSize())
                .totalElements(messagePage.getTotalElements())
                .totalPages(messagePage.getTotalPages())
                .data(messageResponses)
                .build();
    }
    

    @Override
    @Transactional
    public MessageResponse markAsRead(UUID messageId, UUID userId) {
        MessageEntity message = messageRepository.findByMessageIdAndIsDeletedFalse(messageId);
        if (message == null) {
            log.warn(MessageConstants.LOG_ERR_MESSAGE_NOT_FOUND, messageId);
            throw new ResourceNotFoundException(MessageConstants.MESSAGE_ERR_NOT_FOUND);
        }
        
        // Chỉ receiver mới có thể mark as read
        if (!message.getReceiver().getUserId().equals(userId)) {
            log.warn(MessageConstants.LOG_ERR_UNAUTHORIZED, userId, messageId);
            throw new UnauthorizedException(MessageConstants.MESSAGE_ERR_UNAUTHORIZED);
        }
        
        // Update status
        if (message.getStatus() != MessageStatusEnum.READ) {
            message.setStatus(MessageStatusEnum.READ);
            message.setReadAt(LocalDateTime.now());
            messageRepository.save(message);
            log.info(MessageConstants.LOG_SUCCESS_MARK_READ, messageId, userId);
            
            // Publish event để gửi status update qua WebSocket đến sender
            MessageResponse response = messageMapper.toResponse(message);
            eventPublisher.publishEvent(new MessageStatusUpdatedEvent(this, response));
        }
        
        return messageMapper.toResponse(message);
    }
    
    @Override
    @Transactional
    public int markConversationAsRead(UUID currentUserId, UUID otherUserId) {
        // Mark all messages from otherUserId to currentUserId as READ
        // Note: Status updates sẽ được handle qua individual markAsRead calls
        // Nên không cần publish event ở đây để tránh spam
        return messageRepository.markAllAsRead(otherUserId, currentUserId, LocalDateTime.now());
    }
    
    @Override
    @Transactional
    public MessageResponse markAsDelivered(UUID messageId, UUID userId) {
        MessageEntity message = messageRepository.findByMessageIdAndIsDeletedFalse(messageId);
        if (message == null) {
            log.warn(MessageConstants.LOG_ERR_MESSAGE_NOT_FOUND, messageId);
            throw new ResourceNotFoundException(MessageConstants.MESSAGE_ERR_NOT_FOUND);
        }
        
        // Chỉ receiver mới có thể mark as delivered
        if (!message.getReceiver().getUserId().equals(userId)) {
            log.warn(MessageConstants.LOG_ERR_UNAUTHORIZED, userId, messageId);
            throw new UnauthorizedException(MessageConstants.MESSAGE_ERR_UNAUTHORIZED);
        }
        
        // Update status
        if (message.getStatus() == MessageStatusEnum.SENT) {
            message.setStatus(MessageStatusEnum.DELIVERED);
            message.setDeliveredAt(LocalDateTime.now());
            messageRepository.save(message);
            log.info(MessageConstants.LOG_SUCCESS_MARK_DELIVERED, messageId, userId);
            
            // Publish event để gửi status update qua WebSocket đến sender
            MessageResponse response = messageMapper.toResponse(message);
            eventPublisher.publishEvent(new MessageStatusUpdatedEvent(this, response));
        }
        
        return messageMapper.toResponse(message);
    }
    
    @Override
    public long countUnreadMessages(UUID userId) {
        return messageRepository.countUnreadMessages(userId);
    }
    
    @Override
    public PageResponse<MessageResponse> getRecentConversations(UUID userId, Pageable pageable) {
        return PageResponse.<MessageResponse>builder()
                .page(0)
                .size(pageable.getPageSize())
                .totalElements(0L)
                .totalPages(0)
                .data(List.of())
                .build();
    }
    
    @Override
    @Transactional
    public void deleteMessage(UUID messageId, UUID currentUserId) {
        MessageEntity message = messageRepository.findByMessageIdAndIsDeletedFalse(messageId);
        if (message == null) {
            log.warn(MessageConstants.LOG_ERR_MESSAGE_NOT_FOUND, messageId);
            throw new ResourceNotFoundException(MessageConstants.MESSAGE_ERR_NOT_FOUND);
        }
        
        // Chỉ sender mới có thể xóa
        if (!message.getSender().getUserId().equals(currentUserId)) {
            log.warn(MessageConstants.LOG_ERR_UNAUTHORIZED, currentUserId, messageId);
            throw new UnauthorizedException(MessageConstants.MESSAGE_ERR_UNAUTHORIZED);
        }
        
        message.setIsDeleted(true);
        messageRepository.save(message);
        log.info("Deleted message: {}", messageId);
    }
}

