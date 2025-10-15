package com.fpt.evcare.repository;

import com.fpt.evcare.entity.VehiclePartEntity;
import com.fpt.evcare.entity.VehicleTypeEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

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

    //For data initializer
    Optional<VehiclePartEntity> findByVehiclePartNameAndVehicleType(String partName ,VehicleTypeEntity vehicleTypeEntity);
}
