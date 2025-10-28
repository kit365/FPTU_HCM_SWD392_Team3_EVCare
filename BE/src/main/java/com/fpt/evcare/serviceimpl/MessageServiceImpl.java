package com.fpt.evcare.serviceimpl;

import com.fpt.evcare.dto.request.message.CreationMessageRequest;
import com.fpt.evcare.dto.response.MessageResponse;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.entity.MessageEntity;
import com.fpt.evcare.entity.UserEntity;
import com.fpt.evcare.enums.MessageStatusEnum;
import com.fpt.evcare.exception.ResourceNotFoundException;
import com.fpt.evcare.exception.UnauthorizedException;
import com.fpt.evcare.mapper.MessageMapper;
import com.fpt.evcare.repository.MessageRepository;
import com.fpt.evcare.repository.UserRepository;
import com.fpt.evcare.service.MessageService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MessageServiceImpl implements MessageService {

    MessageRepository messageRepository;
    UserRepository userRepository;
    MessageMapper messageMapper;

    @Override
    @Transactional
    public MessageResponse sendMessage(UUID senderId, CreationMessageRequest request) {
        // Validate sender
        UserEntity sender = userRepository.findByUserIdAndIsDeletedFalse(senderId);
        if (sender == null) {
            log.warn("Không tìm thấy người gửi với id: {}", senderId);
            throw new ResourceNotFoundException("Không tìm thấy người gửi");
        }

        // Validate receiver
        UserEntity receiver = userRepository.findByUserIdAndIsDeletedFalse(request.getReceiverId());
        if (receiver == null) {
            log.warn("Không tìm thấy người nhận với id: {}", request.getReceiverId());
            throw new ResourceNotFoundException("Không tìm thấy người nhận");
        }

        // Cannot send to self
        if (senderId.equals(request.getReceiverId())) {
            log.warn("Người dùng {} không thể gửi tin nhắn cho chính mình", senderId);
            throw new IllegalArgumentException("Không thể gửi tin nhắn cho chính mình");
        }

        // Create message
        MessageEntity messageEntity = MessageEntity.builder()
                .sender(sender)
                .receiver(receiver)
                .content(request.getContent())
                .attachmentUrl(request.getAttachmentUrl())
                .isRead(false)
                .status(MessageStatusEnum.SENT)
                .sentAt(LocalDateTime.now())
                .createdBy(sender.getFullName())
                .updatedBy(sender.getFullName())
                .build();

        MessageEntity savedMessage = messageRepository.save(messageEntity);
        log.info("Gửi tin nhắn thành công từ {} đến {}", senderId, request.getReceiverId());

        return messageMapper.toResponse(savedMessage);
    }

    @Override
    public MessageResponse getMessage(UUID messageId, UUID currentUserId) {
        MessageEntity messageEntity = messageRepository.findByMessageIdAndIsDeletedFalse(messageId);
        if (messageEntity == null) {
            log.warn("Không tìm thấy tin nhắn với id: {}", messageId);
            throw new ResourceNotFoundException("Không tìm thấy tin nhắn");
        }

        // Check authorization
        if (!messageEntity.getSender().getUserId().equals(currentUserId) 
            && !messageEntity.getReceiver().getUserId().equals(currentUserId)) {
            log.warn("Người dùng {} không có quyền xem tin nhắn {}", currentUserId, messageId);
            throw new UnauthorizedException("Không có quyền xem tin nhắn này");
        }

        // Mark as read if current user is the receiver
        if (messageEntity.getReceiver().getUserId().equals(currentUserId) && !messageEntity.getIsRead()) {
            messageEntity.setIsRead(true);
            messageRepository.save(messageEntity);
            log.info("Đánh dấu tin nhắn {} đã đọc", messageId);
        }

        return messageMapper.toResponse(messageEntity);
    }

    @Override
    public PageResponse<MessageResponse> getConversation(UUID currentUserId, UUID otherUserId, Pageable pageable) {
        // Validate users
        UserEntity currentUser = userRepository.findByUserIdAndIsDeletedFalse(currentUserId);
        UserEntity otherUser = userRepository.findByUserIdAndIsDeletedFalse(otherUserId);

        if (currentUser == null || otherUser == null) {
            log.warn("Không tìm thấy người dùng");
            throw new ResourceNotFoundException("Không tìm thấy người dùng");
        }

        Page<MessageEntity> messagePage = messageRepository.findConversation(currentUserId, otherUserId, pageable);

        List<MessageResponse> messageResponses = messagePage.getContent().stream()
                .map(messageMapper::toResponse)
                .collect(Collectors.toList());

        log.info("Lấy cuộc trò chuyện giữa {} và {} thành công", currentUserId, otherUserId);

        return PageResponse.<MessageResponse>builder()
                .data(messageResponses)
                .page(messagePage.getNumber())
                .totalElements(messagePage.getTotalElements())
                .totalPages(messagePage.getTotalPages())
                .build();
    }

    @Override
    @Transactional
    public boolean markMessageAsRead(UUID messageId, UUID userId) {
        MessageEntity messageEntity = messageRepository.findByMessageIdAndIsDeletedFalse(messageId);
        if (messageEntity == null) {
            log.warn("Không tìm thấy tin nhắn với id: {}", messageId);
            throw new ResourceNotFoundException("Không tìm thấy tin nhắn");
        }

        // Check authorization
        if (!messageEntity.getReceiver().getUserId().equals(userId)) {
            log.warn("Người dùng {} không có quyền đánh dấu tin nhắn {}", userId, messageId);
            throw new UnauthorizedException("Không có quyền đánh dấu tin nhắn này");
        }

        messageEntity.setIsRead(true);
        messageEntity.setStatus(MessageStatusEnum.DELIVERED);
        messageRepository.save(messageEntity);

        log.info("Đánh dấu tin nhắn {} đã đọc thành công", messageId);
        return true;
    }

    @Override
    public Long getUnreadCount(UUID userId) {
        Long count = messageRepository.countUnreadMessages(userId);
        log.info("Số tin nhắn chưa đọc của người dùng {}: {}", userId, count);
        return count;
    }

    @Override
    @Transactional
    public boolean deleteMessage(UUID messageId, UUID userId) {
        MessageEntity messageEntity = messageRepository.findByMessageIdAndIsDeletedFalse(messageId);
        if (messageEntity == null) {
            log.warn("Không tìm thấy tin nhắn với id: {}", messageId);
            throw new ResourceNotFoundException("Không tìm thấy tin nhắn");
        }

        // Check authorization
        if (!messageEntity.getSender().getUserId().equals(userId) 
            && !messageEntity.getReceiver().getUserId().equals(userId)) {
            log.warn("Người dùng {} không có quyền xóa tin nhắn {}", userId, messageId);
            throw new UnauthorizedException("Không có quyền xóa tin nhắn này");
        }

        messageEntity.setIsDeleted(true);
        messageRepository.save(messageEntity);

        log.info("Xóa tin nhắn {} thành công", messageId);
        return true;
    }

    @Override
    public PageResponse<MessageResponse> getAllMessages(UUID userId, Pageable pageable) {
        Page<MessageEntity> messagePage = messageRepository.findAllByUserId(userId, pageable);

        List<MessageResponse> messageResponses = messagePage.getContent().stream()
                .map(messageMapper::toResponse)
                .collect(Collectors.toList());

        log.info("Lấy tất cả tin nhắn của người dùng {} thành công", userId);

        return PageResponse.<MessageResponse>builder()
                .data(messageResponses)
                .page(messagePage.getNumber())
                .totalElements(messagePage.getTotalElements())
                .totalPages(messagePage.getTotalPages())
                .build();
    }
}


