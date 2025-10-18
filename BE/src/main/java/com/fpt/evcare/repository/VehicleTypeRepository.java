package com.fpt.evcare.repository;

import com.fpt.evcare.entity.VehicleTypeEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface VehicleTypeRepository extends JpaRepository<VehicleTypeEntity, UUID> {
    VehicleTypeEntity findByVehicleTypeIdAndIsDeletedFalse(UUID vehicleTypeId);
    VehicleTypeEntity findByVehicleTypeIdAndIsDeletedTrue(UUID vehicleTypeId);
    List<VehicleTypeEntity> findByIsDeletedFalse();
    Page<VehicleTypeEntity> findAllByIsDeletedFalse(Pageable pageable);
    Page<VehicleTypeEntity> findBySearchContainingIgnoreCaseAndIsDeletedFalse(Pageable pageable, String keyword);
    boolean existsVehiclePartByVehicleTypeNameLikeIgnoreCaseAndIsDeletedFalse(String vehicleTypeName);

}
