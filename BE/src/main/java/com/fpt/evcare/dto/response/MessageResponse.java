package com.fpt.evcare.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fpt.evcare.enums.MessageStatusEnum;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
@JsonInclude(JsonInclude.Include.NON_NULL)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MessageResponse implements Serializable {

    UUID messageId;

    UUID senderId;

    String senderName;

    UUID receiverId;

    String receiverName;

    String content;

    Boolean isRead;

    LocalDateTime sentAt;

    MessageStatusEnum status;

    String attachmentUrl;
}


