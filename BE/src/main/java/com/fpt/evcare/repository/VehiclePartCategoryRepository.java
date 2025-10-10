package com.fpt.evcare.repository;

import com.fpt.evcare.entity.VehiclePartCategoryEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface VehiclePartCategoryRepository extends JpaRepository <VehiclePartCategoryEntity, UUID> {
    VehiclePartCategoryEntity findByVehiclePartCategoryIdAndIsDeletedFalse(UUID id);
    Page<VehiclePartCategoryEntity> findAllByIsDeletedFalse(Pageable pageable);
    Page<VehiclePartCategoryEntity> findBySearchContainingIgnoreCaseAndIsDeletedFalse(String keyword, Pageable pageable);
    boolean existsByPartCategoryNameAndIsDeletedFalse(String partCategoryName);
}
