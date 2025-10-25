package com.fpt.evcare.repository;


import com.fpt.evcare.entity.ServiceTypeEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ServiceTypeRepository extends JpaRepository<ServiceTypeEntity, UUID> {
    ServiceTypeEntity findByServiceTypeIdAndIsDeletedFalse(UUID id);
    ServiceTypeEntity findByServiceTypeIdAndIsDeletedTrue(UUID id);

    @Query(value = "SELECT * FROM service_types " +
            "WHERE vehicle_type_id = :id " +
            "AND parent_id IS NULL " +
            "AND is_deleted = false",
            nativeQuery = true)
    List<ServiceTypeEntity> findByServiceTypeIdAndParentIdIsNullAndIsDeletedFalse(@Param("id") UUID id);

    @Query(value = "SELECT * FROM service_types WHERE vehicle_type_id = :vehicleTypeId AND parent_id = :parentId AND is_deleted = false", nativeQuery = true)
    List<ServiceTypeEntity> findByVehicleTypeAndParent(@Param("vehicleTypeId") UUID vehicleTypeId, @Param("parentId") UUID parentId);

    List<ServiceTypeEntity> findByParentServiceTypeIdAndIsDeletedFalse(UUID id);
    List<ServiceTypeEntity> findByParentServiceTypeIdAndIsDeletedTrue(UUID id);
    List<ServiceTypeEntity> findByVehicleTypeEntityVehicleTypeIdAndIsDeletedFalse(UUID id);
    Page<ServiceTypeEntity> findByVehicleTypeEntityVehicleTypeIdAndIsDeletedFalse(UUID vehicleTypeId, Pageable pageable);
    Page<ServiceTypeEntity> findByVehicleTypeEntityVehicleTypeIdAndServiceNameContainingIgnoreCaseAndIsDeletedFalse(UUID vehicleTypeId, String search, Pageable pageable);

    @Query("""
    SELECT CASE WHEN COUNT(st) > 0 THEN TRUE ELSE FALSE END
    FROM ServiceTypeEntity st
    JOIN VehicleTypeEntity vt ON st.vehicleTypeEntity.vehicleTypeId = vt.vehicleTypeId
    WHERE LOWER(st.serviceName) = LOWER(:serviceName)
      AND vt.vehicleTypeId = :vehicleTypeId
      AND st.isActive = TRUE
      AND st.isDeleted = FALSE
      AND vt.isActive = TRUE
      AND vt.isDeleted = FALSE
""")
    boolean existsByServiceNameAndVehicleTypeId(@Param("serviceName") String serviceName,
                                                @Param("vehicleTypeId") UUID vehicleTypeId);

    // Custom query để lấy CHỈ PARENT services (parentId = null) với pagination
    @Query("""
    SELECT st FROM ServiceTypeEntity st
    WHERE st.vehicleTypeEntity.vehicleTypeId = :vehicleTypeId
      AND st.isDeleted = FALSE
      AND st.parentId IS NULL
      AND (:isActive IS NULL OR st.isActive = :isActive)
    """)
    Page<ServiceTypeEntity> findByVehicleTypeIdAndIsActive(
            @Param("vehicleTypeId") UUID vehicleTypeId,
            @Param("isActive") Boolean isActive,
            Pageable pageable);

    @Query("""
    SELECT st FROM ServiceTypeEntity st
    WHERE st.vehicleTypeEntity.vehicleTypeId = :vehicleTypeId
      AND st.isDeleted = FALSE
      AND st.parentId IS NULL
      AND LOWER(st.serviceName) LIKE LOWER(CONCAT('%', :search, '%'))
      AND (:isActive IS NULL OR st.isActive = :isActive)
    """)
    Page<ServiceTypeEntity> findByVehicleTypeIdAndSearchAndIsActive(
            @Param("vehicleTypeId") UUID vehicleTypeId,
            @Param("search") String search,
            @Param("isActive") Boolean isActive,
            Pageable pageable);
}
