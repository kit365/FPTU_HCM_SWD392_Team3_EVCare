package com.fpt.evcare.repository;


import com.fpt.evcare.entity.ServiceTypeEntity;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface ServiceTypeRepository extends JpaRepository<ServiceTypeEntity, UUID> {
    ServiceTypeEntity findByServiceTypeIdAndIsDeletedFalse(UUID id);
    ServiceTypeEntity findByServiceTypeIdAndIsDeletedTrue(UUID id);
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
}
