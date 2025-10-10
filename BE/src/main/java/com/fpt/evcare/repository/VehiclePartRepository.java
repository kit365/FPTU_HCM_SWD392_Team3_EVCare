package com.fpt.evcare.repository;

import com.fpt.evcare.entity.VehiclePartEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface VehiclePartRepository extends JpaRepository<VehiclePartEntity, UUID> {
    VehiclePartEntity findVehiclePartEntityByVehiclePartIdAndIsDeletedFalse(UUID id);
    VehiclePartEntity findVehiclePartEntityByVehiclePartIdAndIsDeletedTrue(UUID id);
    Page<VehiclePartEntity> findAllByIsDeletedFalse(Pageable pageable);
    Page<VehiclePartEntity> findBySearchContainingIgnoreCaseAndIsDeletedFalse(String search, Pageable pageable);
    boolean existsByVehiclePartNameAndIsDeletedFalse(String name);
}
