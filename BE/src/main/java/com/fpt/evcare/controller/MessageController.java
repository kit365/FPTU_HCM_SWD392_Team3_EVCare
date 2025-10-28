package com.fpt.evcare.controller;

import com.fpt.evcare.base.ApiResponse;
import com.fpt.evcare.constants.MessageConstants;
import com.fpt.evcare.dto.request.message.CreationMessageRequest;
import com.fpt.evcare.dto.response.MessageResponse;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.service.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping(MessageConstants.BASE_URL)
public class MessageController {

    MessageService messageService;

    @PostMapping(MessageConstants.MESSAGE_SEND)
    @Operation(summary = "Gửi tin nhắn", description = "🔐 **Roles:** Authenticated (All roles) - Gửi tin nhắn đến người dùng khác")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<MessageResponse>> sendMessage(
            @RequestHeader("user-id") UUID senderId,
            @Valid @RequestBody CreationMessageRequest request) {
        
        MessageResponse response = messageService.sendMessage(senderId, request);
        
        return ResponseEntity.ok(
                ApiResponse.<MessageResponse>builder()
                        .success(true)
                        .message(MessageConstants.MESSAGE_SUCCESS_SENDING_MESSAGE)
                        .data(response)
                        .build()
        );
    }

    @GetMapping(MessageConstants.MESSAGE_DETAIL)
    @Operation(summary = "Lấy chi tiết tin nhắn", description = "🔐 **Roles:** Authenticated (All roles) - Lấy thông tin chi tiết của một tin nhắn cụ thể")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<MessageResponse>> getMessage(
            @PathVariable("id") UUID messageId,
            @RequestHeader("user-id") UUID userId) {
        
        MessageResponse response = messageService.getMessage(messageId, userId);
        
        return ResponseEntity.ok(
                ApiResponse.<MessageResponse>builder()
                        .success(true)
                        .message(MessageConstants.MESSAGE_SUCCESS_GETTING_MESSAGE)
                        .data(response)
                        .build()
        );
    }

    @GetMapping(MessageConstants.MESSAGE_CONVERSATION)
    @Operation(summary = "Lấy cuộc trò chuyện", description = "🔐 **Roles:** Authenticated (All roles) - Lấy tất cả tin nhắn giữa 2 người dùng")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PageResponse<MessageResponse>>> getConversation(
            @RequestHeader("user-id") UUID currentUserId,
            @PathVariable("userId") UUID otherUserId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "pageSize", defaultValue = "50") int pageSize) {
        
        Pageable pageable = PageRequest.of(page, pageSize);
        PageResponse<MessageResponse> response = messageService.getConversation(currentUserId, otherUserId, pageable);
        
        return ResponseEntity.ok(
                ApiResponse.<PageResponse<MessageResponse>>builder()
                        .success(true)
                        .message(MessageConstants.MESSAGE_SUCCESS_GETTING_CONVERSATION)
                        .data(response)
                        .build()
        );
    }

    @PutMapping(MessageConstants.MESSAGE_MARK_READ)
    @Operation(summary = "Đánh dấu tin nhắn đã đọc", description = "🔐 **Roles:** Authenticated (All roles) - Đánh dấu một tin nhắn là đã đọc")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> markMessageAsRead(
            @PathVariable("id") UUID messageId,
            @RequestHeader("user-id") UUID userId) {
        
        boolean result = messageService.markMessageAsRead(messageId, userId);
        
        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .success(result)
                        .message(MessageConstants.MESSAGE_SUCCESS_MARKING_MESSAGE_AS_READ)
                        .build()
        );
    }

    @GetMapping(MessageConstants.MESSAGE_UNREAD_COUNT)
    @Operation(summary = "Lấy số tin nhắn chưa đọc", description = "🔐 **Roles:** Authenticated (All roles) - Lấy tổng số tin nhắn chưa đọc của người dùng")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(@RequestHeader("user-id") UUID userId) {
        
        Long count = messageService.getUnreadCount(userId);
        
        return ResponseEntity.ok(
                ApiResponse.<Long>builder()
                        .success(true)
                        .data(count)
                        .build()
        );
    }

    @DeleteMapping(MessageConstants.MESSAGE_DELETE)
    @Operation(summary = "Xóa tin nhắn", description = "🔐 **Roles:** Authenticated (All roles) - Xóa một tin nhắn (soft delete)")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> deleteMessage(
            @PathVariable("id") UUID messageId,
            @RequestHeader("user-id") UUID userId) {
        
        boolean result = messageService.deleteMessage(messageId, userId);
        
        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .success(result)
                        .message(MessageConstants.MESSAGE_SUCCESS_DELETING_MESSAGE)
                        .build()
        );
    }

    @GetMapping(MessageConstants.MESSAGE_LIST)
    @Operation(summary = "Lấy tất cả tin nhắn", description = "🔐 **Roles:** Authenticated (All roles) - Lấy tất cả tin nhắn liên quan đến người dùng hiện tại")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PageResponse<MessageResponse>>> getAllMessages(
            @RequestHeader("user-id") UUID userId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "pageSize", defaultValue = "20") int pageSize) {
        
        Pageable pageable = PageRequest.of(page, pageSize);
        PageResponse<MessageResponse> response = messageService.getAllMessages(userId, pageable);
        
        return ResponseEntity.ok(
                ApiResponse.<PageResponse<MessageResponse>>builder()
                        .success(true)
                        .data(response)
                        .build()
        );
    }
}


