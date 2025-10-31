package com.fpt.evcare.repository;

import com.fpt.evcare.entity.VehiclePartEntity;
import com.fpt.evcare.entity.VehicleTypeEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VehiclePartRepository extends JpaRepository<VehiclePartEntity, UUID> {
    VehiclePartEntity findVehiclePartEntityByVehiclePartIdAndIsDeletedFalse(UUID id);
    VehiclePartEntity findVehiclePartEntityByVehiclePartIdAndIsDeletedTrue(UUID id);
    List<VehiclePartEntity> findByVehicleTypeVehicleTypeIdAndIsDeletedFalse(UUID vehicleTypeId);
    Page<VehiclePartEntity> findAllByIsDeletedFalse(Pageable pageable);
    Page<VehiclePartEntity> findBySearchContainingIgnoreCaseAndIsDeletedFalse(String search, Pageable pageable);
    boolean existsByVehiclePartNameAndIsDeletedFalse(String name);
    boolean existsByVehiclePartIdAndIsDeletedFalse(UUID uuid);

    //For data initializer
    Optional<VehiclePartEntity> findByVehiclePartNameAndVehicleType(String partName ,VehicleTypeEntity vehicleTypeEntity);

    @Query(value = """
        SELECT vp.* 
        FROM vehicle_part_inventories vp
        WHERE vp.is_deleted = FALSE
          AND vp.is_active = TRUE
          AND (:keyword IS NULL OR :keyword = '' OR LOWER(vp.search) LIKE LOWER(CONCAT('%', :keyword, '%')))
          AND (:vehicleTypeId IS NULL OR :vehicleTypeId = '' OR vp.vehicle_type_id = CAST(:vehicleTypeId AS UUID))
          AND (:categoryId IS NULL OR :categoryId = '' OR vp.vehicle_part_category_id = CAST(:categoryId AS UUID))
          AND (:status IS NULL OR :status = '' OR UPPER(vp.status) = UPPER(:status))
          AND (:minStock IS NULL OR :minStock = FALSE OR vp.current_quantity <= vp.min_stock)
        ORDER BY vp.vehicle_part_name ASC
        """, nativeQuery = true)
    Page<VehiclePartEntity> findVehiclePartsWithFilters(
            @Param("keyword") String keyword,
            @Param("vehicleTypeId") String vehicleTypeId,
            @Param("categoryId") String categoryId,
            @Param("status") String status,
            @Param("minStock") Boolean minStock,
            Pageable pageable);
}
