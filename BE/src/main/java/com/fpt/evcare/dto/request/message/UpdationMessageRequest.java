package com.fpt.evcare.dto.request.message;

import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class UpdationMessageRequest implements Serializable {

    @Size(max = 500, message = "Nội dung không được vượt quá 500 ký tự")
    String content;

    String attachmentUrl;
}


