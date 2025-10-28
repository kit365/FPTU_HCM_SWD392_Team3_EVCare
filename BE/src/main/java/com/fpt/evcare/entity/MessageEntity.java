package com.fpt.evcare.entity;

import com.fpt.evcare.base.BaseEntity;
import com.fpt.evcare.enums.MessageStatusEnum;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "messages")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@EqualsAndHashCode(callSuper = false)
public class MessageEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    UUID messageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    UserEntity sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    UserEntity receiver;

    @Column(name = "content", length = 500)
    String content;

    @Column(name = "is_read")
    Boolean isRead = false;

    @Column(name = "sent_at", nullable = false)
    LocalDateTime sentAt;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    MessageStatusEnum status = MessageStatusEnum.SENT;

    @Column(name = "attachment_url", length = 255)
    String attachmentUrl;
}


