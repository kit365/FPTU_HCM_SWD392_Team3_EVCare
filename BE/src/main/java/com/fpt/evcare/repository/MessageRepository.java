package com.fpt.evcare.repository;

import com.fpt.evcare.entity.MessageEntity;
import com.fpt.evcare.enums.MessageStatusEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<MessageEntity, UUID> {
    
    /**
     * Tìm tin nhắn theo ID (không bị xóa)
     */
    MessageEntity findByMessageIdAndIsDeletedFalse(UUID messageId);
    
    /**
     * Lấy cuộc trò chuyện giữa 2 users (sorted by sentAt DESC)
     */
    @Query("SELECT m FROM MessageEntity m " +
           "WHERE m.isDeleted = false " +
           "AND ((m.sender.userId = :user1Id AND m.receiver.userId = :user2Id) " +
           "     OR (m.sender.userId = :user2Id AND m.receiver.userId = :user1Id)) " +
           "ORDER BY m.sentAt DESC")
    Page<MessageEntity> findConversation(
        @Param("user1Id") UUID user1Id, 
        @Param("user2Id") UUID user2Id, 
        Pageable pageable
    );
    
    /**
     * Đếm tin nhắn chưa đọc của 1 user
     */
    @Query("SELECT COUNT(m) FROM MessageEntity m " +
           "WHERE m.isDeleted = false " +
           "AND m.receiver.userId = :userId " +
           "AND m.status != 'READ'")
    long countUnreadMessages(@Param("userId") UUID userId);
    
    /**
     * Đếm tin nhắn chưa đọc trong conversation
     */
    @Query("SELECT COUNT(m) FROM MessageEntity m " +
           "WHERE m.isDeleted = false " +
           "AND m.sender.userId = :senderId " +
           "AND m.receiver.userId = :receiverId " +
           "AND m.status != 'READ'")
    long countUnreadInConversation(
        @Param("senderId") UUID senderId, 
        @Param("receiverId") UUID receiverId
    );
    
    /**
     * Lấy tin nhắn cuối cùng trong conversation
     */
    @Query("SELECT m FROM MessageEntity m " +
           "WHERE m.isDeleted = false " +
           "AND ((m.sender.userId = :user1Id AND m.receiver.userId = :user2Id) " +
           "     OR (m.sender.userId = :user2Id AND m.receiver.userId = :user1Id)) " +
           "ORDER BY m.sentAt DESC " +
           "LIMIT 1")
    MessageEntity findLastMessage(
        @Param("user1Id") UUID user1Id, 
        @Param("user2Id") UUID user2Id
    );
    
    /**
     * Lấy danh sách user đã chat với userId (recent conversations)
     */
    @Query("SELECT DISTINCT CASE " +
           "  WHEN m.sender.userId = :userId THEN m.receiver " +
           "  ELSE m.sender " +
           "END " +
           "FROM MessageEntity m " +
           "WHERE m.isDeleted = false " +
           "AND (m.sender.userId = :userId OR m.receiver.userId = :userId) " +
           "ORDER BY m.sentAt DESC")
    List<com.fpt.evcare.entity.UserEntity> findRecentConversationUsers(@Param("userId") UUID userId);
    
    /**
     * Đánh dấu tất cả tin nhắn từ senderId đến receiverId là DELIVERED
     */
    @Modifying
    @Query("UPDATE MessageEntity m " +
           "SET m.status = 'DELIVERED', m.deliveredAt = :deliveredAt " +
           "WHERE m.isDeleted = false " +
           "AND m.sender.userId = :senderId " +
           "AND m.receiver.userId = :receiverId " +
           "AND m.status = 'SENT'")
    int markAllAsDelivered(
        @Param("senderId") UUID senderId, 
        @Param("receiverId") UUID receiverId,
        @Param("deliveredAt") LocalDateTime deliveredAt
    );
    
    /**
     * Đánh dấu tất cả tin nhắn từ senderId đến receiverId là READ
     */
    @Modifying
    @Query("UPDATE MessageEntity m " +
           "SET m.status = 'READ', m.readAt = :readAt " +
           "WHERE m.isDeleted = false " +
           "AND m.sender.userId = :senderId " +
           "AND m.receiver.userId = :receiverId " +
           "AND m.status != 'READ'")
    int markAllAsRead(
        @Param("senderId") UUID senderId, 
        @Param("receiverId") UUID receiverId,
        @Param("readAt") LocalDateTime readAt
    );
}

