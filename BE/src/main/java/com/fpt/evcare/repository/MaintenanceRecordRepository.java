package com.fpt.evcare.repository;

import com.fpt.evcare.entity.MaintenanceRecordEntity;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;

public interface MaintenanceRecordRepository extends JpaRepository<MaintenanceRecordEntity, UUID> {
    MaintenanceRecordEntity findByMaintenanceRecordIdAndIsDeletedFalse(UUID id);

    @Query("""
        SELECT r
        FROM MaintenanceRecordEntity r
        WHERE r.maintenanceManagement.maintenanceManagementId = :managementId
          AND r.isDeleted = false
          AND (
              :keyword IS NULL 
              OR LOWER(r.vehiclePart.search) LIKE LOWER(CONCAT('%', :keyword, '%'))
              OR LOWER(r.search) LIKE LOWER(CONCAT('%', :keyword, '%'))
          )
        """)
    Page<MaintenanceRecordEntity> findByManagementIdAndKeyword(
            @Param("managementId") UUID managementId,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    @Query("""
        SELECT r
        FROM MaintenanceRecordEntity r
        WHERE r.maintenanceManagement.maintenanceManagementId = :managementId
          AND r.isDeleted = false
        """)
    Page<MaintenanceRecordEntity> findByManagementId(
            @Param("managementId") UUID managementId,
            Pageable pageable
    );

    @Query("""
    SELECT r
    FROM MaintenanceRecordEntity r
    WHERE r.maintenanceManagement.maintenanceManagementId = :managementId
      AND r.vehiclePart.vehiclePartId = :vehiclePartId
      AND r.isDeleted = false
    """)
    MaintenanceRecordEntity findByManagementIdAndVehiclePartIdAndIsDeletedFalse(
            @Param("managementId") UUID managementId,
            @Param("vehiclePartId") UUID vehiclePartId
    );

}
