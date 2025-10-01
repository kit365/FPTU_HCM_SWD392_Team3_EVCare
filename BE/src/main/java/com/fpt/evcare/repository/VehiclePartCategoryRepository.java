package com.fpt.evcare.repository;

import com.fpt.evcare.entity.VehiclePartCategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface VehiclePartCategoryRepository extends JpaRepository <VehiclePartCategoryEntity, UUID> {
    VehiclePartCategoryEntity findByVehiclePartCategoryIdAndIsDeletedFalse(UUID id);
    List<VehiclePartCategoryEntity> findAllByIsDeletedFalse();
    List<VehiclePartCategoryEntity> findBySearchContainingIgnoreCase(String keyword);
    boolean existsByPartCategoryName(String partCategoryName);
    boolean existsByPartCategoryNameAndIsDeletedFalse(String partCategoryName);
}
