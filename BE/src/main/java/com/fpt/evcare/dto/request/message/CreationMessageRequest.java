package com.fpt.evcare.dto.request.message;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreationMessageRequest {
    
    UUID senderId;
    @NotNull(message = "ID người nhận không được để trống")
    UUID receiverId;
    @NotBlank(message = "Nội dung tin nhắn không được để trống")
    String content;
    String imageUrl;
}

