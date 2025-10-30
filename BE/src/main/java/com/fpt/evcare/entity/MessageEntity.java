package com.fpt.evcare.entity;

import com.fpt.evcare.enums.MessageStatusEnum;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MessageEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "message_id")
    UUID messageId;
    
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    UserEntity sender;
    
  
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    UserEntity receiver;
    
  
    @Column(name = "content", columnDefinition = "TEXT")
    String content;
    
 
    @Column(name = "image_url")
    String imageUrl;
    

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    MessageStatusEnum status;
    

    @CreationTimestamp
    @Column(name = "sent_at", nullable = false, updatable = false)
    LocalDateTime sentAt;
    
 
    @Column(name = "delivered_at")
    LocalDateTime deliveredAt;
    

    @Column(name = "read_at")
    LocalDateTime readAt;
    

    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    Boolean isDeleted = false;
    
    @Column(name = "created_by")
    String createdBy;
    
    @Column(name = "updated_by")
    String updatedBy;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    LocalDateTime updatedAt;
}

