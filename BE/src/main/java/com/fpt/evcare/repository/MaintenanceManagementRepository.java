package com.fpt.evcare.repository;

import com.fpt.evcare.entity.MaintenanceManagementEntity;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

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

}
