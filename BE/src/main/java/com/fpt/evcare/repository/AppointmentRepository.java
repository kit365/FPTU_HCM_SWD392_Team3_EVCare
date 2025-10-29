package com.fpt.evcare.repository;


import com.fpt.evcare.entity.AppointmentEntity;
import com.fpt.evcare.entity.MaintenanceManagementEntity;
import org.springframework.data.repository.query.Param;
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

    // Dashboard chart queries (PostgreSQL syntax) - only up to current month
    @Query(value = """
        SELECT EXTRACT(MONTH FROM a.scheduled_at) as month, COUNT(*) as count
        FROM appointments a
        WHERE a.is_deleted = FALSE
          AND a.is_active = TRUE
          AND EXTRACT(YEAR FROM a.scheduled_at) = EXTRACT(YEAR FROM CURRENT_DATE)
          AND a.scheduled_at <= CURRENT_DATE
        GROUP BY EXTRACT(MONTH FROM a.scheduled_at)
        ORDER BY EXTRACT(MONTH FROM a.scheduled_at)
        """, nativeQuery = true)
    List<Object[]> countAppointmentsByMonth();

    @Query(value = """
        SELECT st.service_name as serviceName, COUNT(ast.appointment_id) as count
        FROM appointment_service_types ast
        JOIN service_types st ON ast.Service_type_id = st.id
        JOIN appointments a ON ast.appointment_id = a.id
        WHERE a.is_deleted = FALSE
          AND a.is_active = TRUE
          AND st.is_deleted = FALSE
          AND st.is_active = TRUE
        GROUP BY st.service_name
        ORDER BY COUNT(ast.appointment_id) DESC
        LIMIT 10
        """, nativeQuery = true)
    List<Object[]> countAppointmentsByServiceType();

    // Dashboard statistics queries
    @Query("SELECT COUNT(a) FROM AppointmentEntity a WHERE a.isDeleted = false AND a.isActive = true")
    Long countTotalActiveAppointments();

    @Query("SELECT COUNT(a) FROM AppointmentEntity a WHERE a.status = :status AND a.isDeleted = false AND a.isActive = true")
    Long countByStatusAndIsDeletedFalseAndIsActiveTrue(@Param("status") com.fpt.evcare.enums.AppointmentStatusEnum status);

    @Query("SELECT COUNT(a) FROM AppointmentEntity a WHERE a.scheduledAt BETWEEN :startDate AND :endDate AND a.isDeleted = false AND a.isActive = true")
    Long countByScheduledAtBetweenAndIsDeletedFalseAndIsActiveTrue(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Count unique vehicles (by plate number) from appointments
    @Query(value = """
        SELECT COUNT(DISTINCT a.vehicle_number_plate)
        FROM appointments a
        WHERE a.is_deleted = FALSE
          AND a.is_active = TRUE
          AND a.vehicle_number_plate IS NOT NULL
        """, nativeQuery = true)
    Long countUniqueVehicles();

}
