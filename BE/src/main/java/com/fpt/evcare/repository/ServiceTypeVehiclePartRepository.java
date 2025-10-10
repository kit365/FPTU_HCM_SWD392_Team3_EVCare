package com.fpt.evcare.repository;

import com.fpt.evcare.entity.ServiceTypeVehiclePartEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ServiceTypeVehiclePartRepository extends JpaRepository<ServiceTypeVehiclePartEntity, UUID> {
    ServiceTypeVehiclePartEntity findByServiceTypeVehiclePartIdAndIsDeletedFalse(UUID id);
    ServiceTypeVehiclePartEntity findByServiceTypeVehiclePartIdAndIsDeletedTrue(UUID id);
    List<ServiceTypeVehiclePartEntity> findAllByServiceTypeServiceTypeIdAndIsDeletedFalse(UUID id);
    boolean existsByServiceTypeVehiclePartIdAndIsDeletedFalse(UUID id);

    void deleteByServiceTypeServiceTypeId(UUID serviceTypeServiceTypeId);
}
