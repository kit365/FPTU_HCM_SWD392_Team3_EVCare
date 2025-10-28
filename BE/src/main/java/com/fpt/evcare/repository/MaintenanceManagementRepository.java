package com.fpt.evcare.repository;

import com.fpt.evcare.entity.MaintenanceManagementEntity;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface MaintenanceManagementRepository extends JpaRepository<MaintenanceManagementEntity, UUID> {
    MaintenanceManagementEntity findByMaintenanceManagementIdAndIsDeletedFalse(UUID id);
    Page<MaintenanceManagementEntity> findAllBySearchContainingIgnoreCaseAndIsDeletedFalse(String search, Pageable pageable);
    Page<MaintenanceManagementEntity> findAllByIsDeletedFalse(Pageable pageable);

    @Query("SELECT m FROM MaintenanceManagementEntity m WHERE m.appointment.appointmentId = :appointmentId AND m.isDeleted = false")
    List<MaintenanceManagementEntity> findByAppointmentIdAndIsDeletedFalse(@Param("appointmentId") UUID appointmentId);

    @Query("""
        SELECT mm
        FROM MaintenanceManagementEntity mm
        JOIN mm.appointment a
        JOIN a.technicianEntities t
        WHERE t.userId = :technicianId
          AND mm.isDeleted = false
          AND (
              :keyword IS NULL 
              OR LOWER(mm.search) LIKE LOWER(CONCAT('%', :keyword, '%'))
              OR LOWER(a.search) LIKE LOWER(CONCAT('%', :keyword, '%'))
          )
        ORDER BY mm.createdAt DESC
    """)
    Page<MaintenanceManagementEntity> findAllMaintenanceManagementForTechnicianByKeyword(
            @Param("technicianId") UUID technicianId,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    @Query("""
    SELECT mm
    FROM MaintenanceManagementEntity mm
    JOIN mm.appointment a
    JOIN a.technicianEntities t
    WHERE t.userId = :technicianId
      AND mm.isDeleted = false
    ORDER BY mm.createdAt DESC
""")
    Page<MaintenanceManagementEntity> findAllMaintenanceManagementForTechnician(
            @Param("technicianId") UUID technicianId,
            Pageable pageable
    );

    @Query("""
    SELECT CASE WHEN COUNT(mm) > 0 THEN TRUE ELSE FALSE END
    FROM MaintenanceManagementEntity mm
    WHERE mm.appointment.appointmentId = :appointmentId
      AND mm.isDeleted = false
""")
    boolean existsByAppointmentId(@Param("appointmentId") UUID appointmentId);

    @Query("""
    SELECT CASE WHEN COUNT(mm) > 0 THEN TRUE ELSE FALSE END
    FROM MaintenanceManagementEntity mm
    WHERE mm.appointment.appointmentId = :appointmentId
      AND mm.status = :status
      AND mm.isDeleted = false
""")
    boolean existsByAppointmentIdAndStatus(@Param("appointmentId") UUID appointmentId, @Param("status") String status);

    @Query(value = """
        SELECT mm.* 
        FROM maintenance_managements mm
        JOIN appointments a ON mm.appointment_id = a.id
        LEFT JOIN vehicles v ON a.vehicle_id = v.id
        WHERE mm.is_deleted = FALSE
          AND a.is_deleted = FALSE
          AND (:keyword IS NULL OR :keyword = '' OR LOWER(mm.search) LIKE LOWER(CONCAT('%', :keyword, '%')))
          AND (:status IS NULL OR :status = '' OR UPPER(mm.status) = UPPER(:status))
          AND (:vehicleId IS NULL OR :vehicleId = '' OR v.id = CAST(:vehicleId AS UUID))
          AND (:fromDate IS NULL OR mm.created_at >= CAST(:fromDate AS TIMESTAMP))
          AND (:toDate IS NULL OR mm.created_at <= CAST(:toDate AS TIMESTAMP))
        ORDER BY mm.created_at DESC
        """, nativeQuery = true)
    Page<MaintenanceManagementEntity> findAllMaintenanceManagementsWithFilters(
            @Param("keyword") String keyword,
            @Param("status") String status,
            @Param("vehicleId") String vehicleId,
            @Param("fromDate") String fromDate,
            @Param("toDate") String toDate,
            Pageable pageable);

    @Query(value = """
        SELECT mm.*
        FROM maintenance_managements mm
        JOIN appointments a ON mm.appointment_id = a.id
        LEFT JOIN shifts s ON s.appointment_id = a.id
        JOIN appointment_technicians at ON a.id = at.appointment_id
        WHERE at.technician_id = :technicianId
          AND mm.is_deleted = false
          AND DATE(s.start_time) = :targetDate
        ORDER BY s.start_time ASC, mm.created_at ASC
    """, nativeQuery = true)
    Page<MaintenanceManagementEntity> findByTechnicianAndDate(
            @Param("technicianId") UUID technicianId,
            @Param("targetDate") LocalDate targetDate,
            Pageable pageable
    );

    @Query(value = """
        SELECT mm.*
        FROM maintenance_managements mm
        JOIN appointments a ON mm.appointment_id = a.id
        LEFT JOIN shifts s ON s.appointment_id = a.id
        JOIN appointment_technicians at ON a.id = at.appointment_id
        WHERE at.technician_id = :technicianId
          AND mm.is_deleted = false
          AND DATE(s.start_time) = :targetDate
          AND UPPER(mm.status) = UPPER(CAST(:status AS VARCHAR))
        ORDER BY s.start_time ASC, mm.created_at ASC
    """, nativeQuery = true)
    Page<MaintenanceManagementEntity> findByTechnicianAndDateAndStatus(
            @Param("technicianId") UUID technicianId,
            @Param("targetDate") LocalDate targetDate,
            @Param("status") String status,
            Pageable pageable
    );

    @Query(value = """
        SELECT mm.*
        FROM maintenance_managements mm
        JOIN appointments a ON mm.appointment_id = a.id
        LEFT JOIN shifts s ON s.appointment_id = a.id
        JOIN appointment_technicians at ON a.id = at.appointment_id
        WHERE at.technician_id = :technicianId
          AND mm.is_deleted = false
          AND (:keyword IS NULL OR :keyword = '' OR LOWER(mm.search) LIKE LOWER(CONCAT('%', :keyword, '%')))
          AND (:date IS NULL OR :date = '' OR DATE(s.start_time) = CAST(:date AS DATE))
          AND (:status IS NULL OR :status = '' OR UPPER(mm.status) = UPPER(CAST(:status AS VARCHAR)))
          AND (:appointmentId IS NULL OR :appointmentId = '' OR a.id = CAST(:appointmentId AS UUID))
        ORDER BY mm.created_at DESC
    """, nativeQuery = true)
    Page<MaintenanceManagementEntity> findByTechnicianWithFilters(
            @Param("technicianId") UUID technicianId,
            @Param("keyword") String keyword,
            @Param("date") String date,
            @Param("status") String status,
            @Param("appointmentId") String appointmentId,
            Pageable pageable
    );

}
