package com.fpt.evcare.repository;

import com.fpt.evcare.entity.VehicleEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface VehicleRepository extends JpaRepository<VehicleEntity, UUID> {
    VehicleEntity findByVehicleIdAndIsDeletedFalse(UUID vehicleId);
    VehicleEntity findByVehicleIdAndIsDeletedTrue(UUID vehicleId);
    Page<VehicleEntity> findAllByIsDeletedFalse(Pageable pageable);
    Page<VehicleEntity> findBySearchContainingIgnoreCaseAndIsDeletedFalse(String keyword, Pageable pageable);

    // Filter by vehicle type
    Page<VehicleEntity> findAllByVehicleType_VehicleTypeIdAndIsDeletedFalse(UUID vehicleTypeId, Pageable pageable);
    Page<VehicleEntity> findBySearchContainingIgnoreCaseAndVehicleType_VehicleTypeIdAndIsDeletedFalse(String keyword, UUID vehicleTypeId, Pageable pageable);

    boolean existsByVehicleIdAndIsDeletedFalse(UUID isDeleted);

    boolean existsByPlateNumberAndIsDeletedFalse(String plateNumber);

    boolean existsByVinAndIsDeletedFalse(String vin);

}
