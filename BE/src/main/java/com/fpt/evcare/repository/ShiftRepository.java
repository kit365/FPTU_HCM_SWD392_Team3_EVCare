package com.fpt.evcare.repository;

import com.fpt.evcare.entity.ShiftEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface ShiftRepository extends JpaRepository<ShiftEntity, UUID> {
    
    ShiftEntity findByShiftIdAndIsDeletedFalse(UUID shiftId);
    
    Page<ShiftEntity> findByIsDeletedFalse(Pageable pageable);
    
    @Query("""
        SELECT s FROM ShiftEntity s
        WHERE s.isDeleted = false
        AND (
            LOWER(s.search) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(s.notes) LIKE LOWER(CONCAT('%', :keyword, '%'))
        )
    """)
    Page<ShiftEntity> findBySearchContainingIgnoreCaseAndIsDeletedFalse(
            @Param("keyword") String keyword,
            Pageable pageable);
    
    @Query("""
        SELECT s FROM ShiftEntity s
        WHERE s.appointment.appointmentId = :appointmentId
        AND s.isDeleted = false
    """)
    Page<ShiftEntity> findByAppointmentId(
            @Param("appointmentId") UUID appointmentId,
            Pageable pageable);

    // Tìm shifts của 1 technician trong khoảng thời gian
    @Query("""
        SELECT s FROM ShiftEntity s JOIN s.technicians t
        WHERE t.userId = :technicianId
        AND s.isDeleted = false
        AND s.isActive = true
        AND (
            (s.startTime <= :endTime AND s.endTime >= :startTime) OR
            (s.startTime >= :startTime AND s.startTime < :endTime)
        )
        AND (:excludeShiftId IS NULL OR s.shiftId != :excludeShiftId)
    """)
    List<ShiftEntity> findConflictingShiftsByTechnician(
            @Param("technicianId") UUID technicianId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("excludeShiftId") UUID excludeShiftId
    );

    // Tìm tất cả shifts cần update status (scheduled -> in_progress)
    @Query("""
        SELECT s FROM ShiftEntity s
        WHERE s.isDeleted = false
        AND s.status = 'SCHEDULED'
        AND s.startTime <= :now
    """)
    List<ShiftEntity> findShiftsToStartNow(@Param("now") LocalDateTime now);

    // Tìm tất cả shifts cần update status (in_progress -> completed)
    @Query("""
        SELECT s FROM ShiftEntity s
        WHERE s.isDeleted = false
        AND s.status = 'IN_PROGRESS'
        AND s.endTime <= :now
    """)
    List<ShiftEntity> findShiftsToCompleteNow(@Param("now") LocalDateTime now);

    // Tìm shifts PENDING_ASSIGNMENT quá giờ (startTime đã qua mà chưa phân công)
    @Query("""
        SELECT s FROM ShiftEntity s
        WHERE s.isDeleted = false
        AND s.status = 'PENDING_ASSIGNMENT'
        AND s.startTime <= :now
    """)
    List<ShiftEntity> findShiftsWithLateAssignment(@Param("now") LocalDateTime now);
}



