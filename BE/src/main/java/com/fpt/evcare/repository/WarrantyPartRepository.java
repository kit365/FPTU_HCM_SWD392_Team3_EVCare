package com.fpt.evcare.repository;

import com.fpt.evcare.entity.WarrantyPartEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface WarrantyPartRepository extends JpaRepository<WarrantyPartEntity, UUID> {
    
    Optional<WarrantyPartEntity> findByWarrantyPartIdAndIsDeletedFalse(UUID id);
    
    Optional<WarrantyPartEntity> findByWarrantyPartIdAndIsDeletedTrue(UUID id);
    
    Page<WarrantyPartEntity> findAllByIsDeletedFalse(Pageable pageable);
    
    Page<WarrantyPartEntity> findBySearchContainingIgnoreCaseAndIsDeletedFalse(String search, Pageable pageable);
    
    boolean existsByVehiclePartVehiclePartIdAndIsDeletedFalse(UUID vehiclePartId);
    
    Page<WarrantyPartEntity> findByVehiclePartVehiclePartIdAndIsDeletedFalse(UUID vehiclePartId, Pageable pageable);
    
    Optional<WarrantyPartEntity> findByVehiclePartVehiclePartIdAndIsDeletedFalseAndIsActiveTrue(UUID vehiclePartId);
    
    Optional<WarrantyPartEntity> findByVehiclePartVehiclePartIdAndIsDeletedFalse(UUID vehiclePartId);
    
    Optional<WarrantyPartEntity> findByVehiclePartVehiclePartIdAndIsDeletedTrue(UUID vehiclePartId);
}
