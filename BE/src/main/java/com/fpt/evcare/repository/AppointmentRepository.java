package com.fpt.evcare.repository;


import com.fpt.evcare.entity.AppointmentEntity;
import com.fpt.evcare.entity.MaintenanceManagementEntity;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface AppointmentRepository extends JpaRepository<AppointmentEntity, UUID> {
    AppointmentEntity findByAppointmentIdAndIsDeletedFalse(UUID appointmentId);
    Page<AppointmentEntity> findByIsDeletedFalse(Pageable pageable);
    Page<AppointmentEntity> findBySearchContainingIgnoreCaseAndIsDeletedFalse(String keyword, Pageable pageable);

    @Query(value = """
        SELECT a.* 
        FROM appointments a
        JOIN users u ON a.customer_id = u.id
        WHERE a.is_deleted = FALSE
          AND a.is_active = TRUE
          AND u.is_deleted = FALSE
          AND u.is_active = TRUE
          AND a.customer_id = :userId
          AND (
              LOWER(a.search) LIKE LOWER(CONCAT('%', :keyword, '%'))
              OR LOWER(a.customer_full_name) LIKE LOWER(CONCAT('%', :keyword, '%'))
              OR LOWER(a.customer_email) LIKE LOWER(CONCAT('%', :keyword, '%'))
              OR LOWER(a.customer_phone_number) LIKE LOWER(CONCAT('%', :keyword, '%'))
          )
        """, nativeQuery = true)
    Page<AppointmentEntity> findAppointmentsByCustomerAndKeyword(
            @Param("userId") UUID userId,
            @Param("keyword") String keyword,
            Pageable pageable);

    @Query("""
    SELECT mm
    FROM MaintenanceManagementEntity mm
    JOIN mm.appointment a
    WHERE mm.status IN ('IN_PROGRESS')
      AND mm.isDeleted = false
      AND a.isDeleted = false
      AND a.appointmentId = :appointmentId
    ORDER BY mm.createdAt DESC
""")
    List<MaintenanceManagementEntity> findAllInProgressMaintenanceManagementsByAppointmentId(
            @Param("appointmentId") UUID appointmentId
    );

    Page<AppointmentEntity> findAllBySearchContainingIgnoreCaseAndCustomerIsNull(String keyword, Pageable pageable);

    Page<AppointmentEntity> findAllBySearchContainingIgnoreCaseAndCustomerIsNotNull(String keyword, Pageable pageable);

    @Query(value = """
        SELECT a.* 
        FROM appointments a
        WHERE a.is_deleted = FALSE
          AND a.is_active = TRUE
          AND (:keyword IS NULL OR :keyword = '' OR LOWER(a.search) LIKE LOWER(CONCAT('%', :keyword, '%')))
          AND (:status IS NULL OR :status = '' OR UPPER(a.status) = UPPER(:status))
          AND (:serviceMode IS NULL OR :serviceMode = '' OR UPPER(a.service_mode) = UPPER(:serviceMode))
          AND (:fromDate IS NULL OR a.scheduled_at >= CAST(:fromDate AS TIMESTAMP))
          AND (:toDate IS NULL OR a.scheduled_at <= CAST(:toDate AS TIMESTAMP))
        ORDER BY a.scheduled_at DESC
        """, nativeQuery = true)
    Page<AppointmentEntity> findAppointmentsWithFilters(
            @Param("keyword") String keyword,
            @Param("status") String status,
            @Param("serviceMode") String serviceMode,
            @Param("fromDate") String fromDate,
            @Param("toDate") String toDate,
            Pageable pageable);

}
