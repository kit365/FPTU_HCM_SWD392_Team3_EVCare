package com.fpt.evcare.repository;

import com.fpt.evcare.entity.EmployeeProfileEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface EmployeeProfileRepository extends JpaRepository<EmployeeProfileEntity, UUID> {
    EmployeeProfileEntity findByEmployeeProfileIdAndIsDeletedFalse(UUID vehicleId);
    EmployeeProfileEntity findByEmployeeProfileIdAndIsDeletedTrue(UUID vehicleId);
    Page<EmployeeProfileEntity> findAllByIsDeletedFalse(Pageable pageable);
    Page<EmployeeProfileEntity> findBySearchContainingIgnoreCaseAndIsDeletedFalse(String keyword, Pageable pageable);

    boolean existsByEmployeeProfileIdAndIsDeletedFalse(UUID isDeleted);


}
