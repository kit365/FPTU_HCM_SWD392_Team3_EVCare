package com.fpt.evcare.repository;


import com.fpt.evcare.entity.MessageEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface MessageRepository extends JpaRepository<MessageEntity, UUID> {

    MessageEntity findByMessageIdAndIsDeletedFalse(UUID messageId);
    MessageEntity findByMessageIdAndIsDeletedTrue(UUID messageId);

    @Query("""
        SELECT m FROM MessageEntity m
        WHERE m.isDeleted = false
          AND (
              (m.sender.userId = :currentUserId AND m.receiver.userId = :otherUserId)
              OR
              (m.sender.userId = :otherUserId AND m.receiver.userId = :currentUserId)
          )
        ORDER BY m.sentAt DESC
        """)
    Page<MessageEntity> findConversation(
            @Param("currentUserId") UUID currentUserId,
            @Param("otherUserId") UUID otherUserId,
            Pageable pageable
    );

    @Query("""
        SELECT m FROM MessageEntity m
        WHERE m.receiver.userId = :userId
          AND m.isRead = false
          AND m.isDeleted = false
        """)
    Page<MessageEntity> findUnreadMessages(
            @Param("userId") UUID userId,
            Pageable pageable
    );

    @Query("""
        SELECT COUNT(m) FROM MessageEntity m
        WHERE m.receiver.userId = :userId
          AND m.isRead = false
          AND m.isDeleted = false
        """)
    Long countUnreadMessages(@Param("userId") UUID userId);

    @Query("""
        SELECT m FROM MessageEntity m
        WHERE (m.sender.userId = :userId OR m.receiver.userId = :userId)
          AND m.isDeleted = false
        ORDER BY m.sentAt DESC
        """)
    Page<MessageEntity> findAllByUserId(@Param("userId") UUID userId, Pageable pageable);
}


