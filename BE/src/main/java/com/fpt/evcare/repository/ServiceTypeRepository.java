package com.fpt.evcare.repository;


import com.fpt.evcare.entity.ServiceTypeEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ServiceTypeRepository extends JpaRepository<ServiceTypeEntity, UUID> {
    ServiceTypeEntity findByServiceTypeIdAndIsDeletedFalse(UUID id);
    boolean existsByServiceNameIgnoreCaseAndIsDeletedFalse(String serviceName);
    Page<ServiceTypeEntity> findByIsDeletedFalse(Pageable pageable);
    Page<ServiceTypeEntity> findByServiceNameContainingIgnoreCaseAndIsDeletedFalse(String search, Pageable pageable);
}
