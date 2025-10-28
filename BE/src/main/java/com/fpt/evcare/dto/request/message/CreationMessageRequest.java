package com.fpt.evcare.dto.request.message;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class CreationMessageRequest implements Serializable {

    @NotNull(message = "Receiver ID không được để trống")
    UUID receiverId;

    @NotNull(message = "Nội dung không được để trống")
    @Size(max = 500, message = "Nội dung không được vượt quá 500 ký tự")
    String content;

    String attachmentUrl;
}

