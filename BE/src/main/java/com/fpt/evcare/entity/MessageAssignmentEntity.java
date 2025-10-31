package com.fpt.evcare.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity quản lý việc phân công admin/staff phụ trách chat với customer
 * 1 Customer chỉ được assign 1 Admin/Staff tại 1 thời điểm
 * Admin có thể phân lại hoặc reassign
 */
@Entity
@Table(name = "message_assignments", 
       uniqueConstraints = @UniqueConstraint(columnNames = "customer_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MessageAssignmentEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "assignment_id")
    UUID assignmentId;
    
    /**
     * Customer cần được support
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false, unique = true)
    UserEntity customer;
    
    /**
     * Admin/Staff được assign để chat với customer này
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_staff_id", nullable = false)
    UserEntity assignedStaff;
    
    /**
     * Admin thực hiện việc assign
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by_id")
    UserEntity assignedBy;
    
    /**
     * Thời gian assign
     */
    @CreationTimestamp
    @Column(name = "assigned_at", nullable = false, updatable = false)
    LocalDateTime assignedAt;
    
    /**
     * Trạng thái assignment
     */
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    Boolean isActive = true;
    
    /**
     * Ghi chú
     */
    @Column(name = "notes", columnDefinition = "TEXT")
    String notes;
    
    /**
     * Soft delete
     */
    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    Boolean isDeleted = false;
    
    /**
     * Audit fields
     */
    @Column(name = "created_by")
    String createdBy;
    
    @Column(name = "updated_by")
    String updatedBy;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    LocalDateTime updatedAt;
}

