package com.fpt.evcare.controller;

import com.fpt.evcare.base.ApiResponse;
import com.fpt.evcare.constants.MessageConstants;
import com.fpt.evcare.dto.request.message.CreationMessageRequest;

import com.fpt.evcare.dto.response.MessageResponse;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.service.AuthService;
import com.fpt.evcare.service.MessageService;
import com.fpt.evcare.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/messages")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Message API", description = "REST API cho quản lý tin nhắn")
public class MessageController {

    MessageService messageService;

    @PostMapping("/send")
    @Operation(summary = "Gửi tin nhắn", description = "Authenticated - Gửi tin nhắn đến user khác")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<MessageResponse>> sendMessage(
            Principal principal,
            @Valid @RequestBody CreationMessageRequest request
    ) {
        UUID senderId = UUID.fromString(principal.getName());
        MessageResponse response = messageService.sendMessage(senderId, request);

        return ResponseEntity.ok(ApiResponse.<MessageResponse>builder()
                .success(true)
                .message(MessageConstants.MESSAGE_SUCCESS_SEND)
                .data(response)
                .build());
    }



    /**
     * Lấy chi tiết 1 tin nhắn
     */
    @GetMapping("/{messageId}")
    @Operation(summary = "Lấy chi tiết tin nhắn", description = "🔐 Authenticated - Chỉ sender/receiver mới xem được")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<MessageResponse>> getMessage(
            @PathVariable UUID messageId,
            java.security.Principal principal
    ) {
        UUID userId = UUID.fromString(principal.getName());
        MessageResponse response = messageService.getMessage(messageId, userId);

        return ResponseEntity.ok(ApiResponse.<MessageResponse>builder()
                .success(true)
                .message("Lấy tin nhắn thành công")
                .data(response)
                .build());
    }

    /**
     * Lấy cuộc trò chuyện với user khác (phân trang)
     */
    @GetMapping("/conversation/{otherUserId}")
    @Operation(summary = "Lấy cuộc trò chuyện", description = "🔐 Authenticated - Lấy lịch sử chat với user khác (phân trang)")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PageResponse<MessageResponse>>> getConversation(
            @PathVariable UUID otherUserId,
            java.security.Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int pageSize
    ) {
        UUID currentUserId = UUID.fromString(principal.getName());
        Pageable pageable = PageRequest.of(page, pageSize);
        PageResponse<MessageResponse> response = messageService.getConversation(currentUserId, otherUserId, pageable);

        return ResponseEntity.ok(ApiResponse.<PageResponse<MessageResponse>>builder()
                .success(true)
                .message("Lấy cuộc trò chuyện thành công")
                .data(response)
                .build());
    }

    /**
     * Đánh dấu 1 tin nhắn đã đọc
     */
    @PutMapping("/{messageId}/mark-read")
    @Operation(summary = "Đánh dấu tin nhắn đã đọc", description = "🔐 Authenticated - Đánh dấu 1 tin nhắn cụ thể là đã đọc")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<MessageResponse>> markMessageAsRead(
            @PathVariable UUID messageId,
            java.security.Principal principal
    ) {
        UUID userId = UUID.fromString(principal.getName());
        MessageResponse response = messageService.markAsRead(messageId, userId);

        return ResponseEntity.ok(ApiResponse.<MessageResponse>builder()
                .success(true)
                .message(MessageConstants.MESSAGE_SUCCESS_MARK_READ)
                .data(response)
                .build());
    }

    /**
     * Đánh dấu tất cả tin nhắn từ otherUserId là đã đọc
     */
    @PutMapping("/conversation/{otherUserId}/mark-read")
    @Operation(summary = "Đánh dấu conversation đã đọc", description = "🔐 Authenticated - Đánh dấu tất cả tin nhắn từ user khác là đã đọc")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Integer>> markConversationAsRead(
            @PathVariable UUID otherUserId,
            java.security.Principal principal
    ) {
        UUID currentUserId = UUID.fromString(principal.getName());
        int count = messageService.markConversationAsRead(currentUserId, otherUserId);

        return ResponseEntity.ok(ApiResponse.<Integer>builder()
                .success(true)
                .message(MessageConstants.MESSAGE_SUCCESS_MARK_READ)
                .data(count)
                .build());
    }

    /**
     * Đếm số tin nhắn chưa đọc
     */
    @GetMapping("/unread-count")
    @Operation(summary = "Đếm tin nhắn chưa đọc", description = "🔐 Authenticated - Đếm tổng số tin nhắn chưa đọc của user")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(
            java.security.Principal principal
    ) {
        UUID userId = UUID.fromString(principal.getName());
        long count = messageService.countUnreadMessages(userId);

        return ResponseEntity.ok(ApiResponse.<Long>builder()
                .success(true)
                .message("Lấy số tin nhắn chưa đọc thành công")
                .data(count)
                .build());
    }

    /**
     * Lấy danh sách recent conversations
     */
    @GetMapping("/conversations")
    @Operation(summary = "Lấy danh sách cuộc trò chuyện", description = "🔐 Authenticated - Lấy danh sách users đã chat với")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PageResponse<MessageResponse>>> getRecentConversations(
            java.security.Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize
    ) {
        UUID userId = UUID.fromString(principal.getName());
        Pageable pageable = PageRequest.of(page, pageSize);
        PageResponse<MessageResponse> response = messageService.getRecentConversations(userId, pageable);

        return ResponseEntity.ok(ApiResponse.<PageResponse<MessageResponse>>builder()
                .success(true)
                .message("Lấy danh sách cuộc trò chuyện thành công")
                .data(response)
                .build());
    }

    /**
     * Xóa tin nhắn (soft delete)
     */
    @DeleteMapping("/{messageId}")
    @Operation(summary = "Xóa tin nhắn", description = "🔐 Authenticated - Chỉ sender mới có thể xóa")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> deleteMessage(
            @PathVariable UUID messageId,
            java.security.Principal principal
    ) {
        UUID userId = UUID.fromString(principal.getName());
        messageService.deleteMessage(messageId, userId);

        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(true)
                .message(MessageConstants.MESSAGE_SUCCESS_DELETE)
                .data("Message deleted successfully")
                .build());
    }
}

