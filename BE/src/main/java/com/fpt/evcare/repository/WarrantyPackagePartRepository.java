package com.fpt.evcare.repository;

import com.fpt.evcare.entity.WarrantyPackagePartEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WarrantyPackagePartRepository extends JpaRepository<WarrantyPackagePartEntity, UUID> {
    
    Optional<WarrantyPackagePartEntity> findByWarrantyPackagePartIdAndIsDeletedFalse(UUID id);
    
    Page<WarrantyPackagePartEntity> findByWarrantyPackage_WarrantyPackageIdAndIsDeletedFalse(
            UUID warrantyPackageId, Pageable pageable);
    
    List<WarrantyPackagePartEntity> findByVehiclePart_VehiclePartIdAndIsDeletedFalse(UUID vehiclePartId);
    
    /**
     * Kiểm tra xem phụ tùng có bảo hành còn hiệu lực không (cho một xe cụ thể)
     * @param vehicleId ID của xe
     * @param vehiclePartId ID của phụ tùng
     * @param checkDate Ngày cần kiểm tra (thường là ngày hiện tại)
     * @return true nếu có bảo hành còn hiệu lực
     */
    @Query(value = """
        SELECT EXISTS (
            SELECT 1
            FROM warranty_package_parts wpp
            JOIN warranty_packages wp ON wpp.warranty_package_id = wp.id
            WHERE wpp.vehicle_part_inventory_id = :vehiclePartId
              AND (wpp.vehicle_id = :vehicleId OR wpp.vehicle_id IS NULL)
              AND wpp.is_deleted = FALSE
              AND wpp.is_active = TRUE
              AND wp.is_deleted = FALSE
              AND wp.is_active = TRUE
              AND (wpp.warranty_expiry_date IS NULL OR wpp.warranty_expiry_date >= :checkDate)
              AND (wp.start_date IS NULL OR wp.start_date <= :checkDate)
              AND (wp.end_date IS NULL OR wp.end_date >= :checkDate)
        )
        """, nativeQuery = true)
    boolean existsValidWarrantyForVehiclePart(
            @Param("vehicleId") UUID vehicleId,
            @Param("vehiclePartId") UUID vehiclePartId,
            @Param("checkDate") LocalDateTime checkDate);
    
    /**
     * Kiểm tra xem phụ tùng có bảo hành còn hiệu lực không (tổng quát - không cần vehicle)
     * @param vehiclePartId ID của phụ tùng
     * @param checkDate Ngày cần kiểm tra
     * @return true nếu có bảo hành còn hiệu lực
     */
    @Query(value = """
        SELECT EXISTS (
            SELECT 1
            FROM warranty_package_parts wpp
            JOIN warranty_packages wp ON wpp.warranty_package_id = wp.id
            WHERE wpp.vehicle_part_inventory_id = :vehiclePartId
              AND wpp.vehicle_id IS NULL
              AND wpp.is_deleted = FALSE
              AND wpp.is_active = TRUE
              AND wp.is_deleted = FALSE
              AND wp.is_active = TRUE
              AND (wpp.warranty_expiry_date IS NULL OR wpp.warranty_expiry_date >= :checkDate)
              AND (wp.start_date IS NULL OR wp.start_date <= :checkDate)
              AND (wp.end_date IS NULL OR wp.end_date >= :checkDate)
        )
        """, nativeQuery = true)
    boolean existsValidWarrantyForVehiclePartGeneral(
            @Param("vehiclePartId") UUID vehiclePartId,
            @Param("checkDate") LocalDateTime checkDate);
    
    /**
     * Lấy danh sách phụ tùng bảo hành theo vehicle và vehiclePart
     */
    @Query(value = """
        SELECT wpp.*
        FROM warranty_package_parts wpp
        JOIN warranty_packages wp ON wpp.warranty_package_id = wp.id
        WHERE wpp.vehicle_part_inventory_id = :vehiclePartId
          AND (wpp.vehicle_id = :vehicleId OR wpp.vehicle_id IS NULL)
          AND wpp.is_deleted = FALSE
          AND wpp.is_active = TRUE
          AND wp.is_deleted = FALSE
          AND wp.is_active = TRUE
          AND (wpp.warranty_expiry_date IS NULL OR wpp.warranty_expiry_date >= :checkDate)
          AND (wp.start_date IS NULL OR wp.start_date <= :checkDate)
          AND (wp.end_date IS NULL OR wp.end_date >= :checkDate)
        """, nativeQuery = true)
    List<WarrantyPackagePartEntity> findValidWarrantiesForVehiclePart(
            @Param("vehicleId") UUID vehicleId,
            @Param("vehiclePartId") UUID vehiclePartId,
            @Param("checkDate") LocalDateTime checkDate);
}

