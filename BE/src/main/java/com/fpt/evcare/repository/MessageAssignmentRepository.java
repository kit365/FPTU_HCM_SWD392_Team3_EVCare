package com.fpt.evcare.repository;

import com.fpt.evcare.entity.MessageAssignmentEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MessageAssignmentRepository extends JpaRepository<MessageAssignmentEntity, UUID> {
    
    /**
     * Tìm assignment theo customer ID (active only)
     */
    @Query("SELECT ma FROM MessageAssignmentEntity ma " +
           "WHERE ma.isDeleted = false " +
           "AND ma.isActive = true " +
           "AND ma.customer.userId = :customerId")
    Optional<MessageAssignmentEntity> findActiveByCustomerId(@Param("customerId") UUID customerId);
    
    /**
     * Lấy tất cả assignments của 1 staff (active only)
     */
    @Query("SELECT ma FROM MessageAssignmentEntity ma " +
           "WHERE ma.isDeleted = false " +
           "AND ma.isActive = true " +
           "AND ma.assignedStaff.userId = :staffId " +
           "ORDER BY ma.assignedAt DESC")
    Page<MessageAssignmentEntity> findAllByStaffId(@Param("staffId") UUID staffId, Pageable pageable);
    
    /**
     * Lấy tất cả assignments (cho admin)
     */
    @Query("SELECT ma FROM MessageAssignmentEntity ma " +
           "WHERE ma.isDeleted = false " +
           "AND ma.isActive = true " +
           "ORDER BY ma.assignedAt DESC")
    Page<MessageAssignmentEntity> findAllActive(Pageable pageable);
    
    /**
     * Lấy tất cả assignments (bao gồm inactive, cho admin)
     */
    @Query("SELECT ma FROM MessageAssignmentEntity ma " +
           "WHERE ma.isDeleted = false " +
           "ORDER BY ma.assignedAt DESC")
    Page<MessageAssignmentEntity> findAll(Pageable pageable);
    
    /**
     * Kiểm tra customer đã được assign chưa
     */
    @Query("SELECT COUNT(ma) > 0 FROM MessageAssignmentEntity ma " +
           "WHERE ma.isDeleted = false " +
           "AND ma.isActive = true " +
           "AND ma.customer.userId = :customerId")
    boolean existsActiveAssignmentByCustomerId(@Param("customerId") UUID customerId);
    
    /**
     * Lấy danh sách customers chưa được assign
     */
    @Query("SELECT u FROM UserEntity u " +
           "WHERE u.isDeleted = false " +
           "AND u.role.roleName = 'CUSTOMER' " +
           "AND u.userId NOT IN (" +
           "  SELECT ma.customer.userId FROM MessageAssignmentEntity ma " +
           "  WHERE ma.isDeleted = false AND ma.isActive = true" +
           ")")
    Page<com.fpt.evcare.entity.UserEntity> findUnassignedCustomers(Pageable pageable);
    
    /**
     * Đếm số customer active được assign cho staff (for load balancing)
     */
    @Query("SELECT COUNT(ma) FROM MessageAssignmentEntity ma " +
           "WHERE ma.isDeleted = false " +
           "AND ma.isActive = true " +
           "AND ma.assignedStaff.userId = :staffId")
    long countActiveByStaffId(@Param("staffId") UUID staffId);
}

