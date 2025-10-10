package com.fpt.evcare.repository;


import com.fpt.evcare.entity.ServiceTypeEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ServiceTypeRepository extends JpaRepository<ServiceTypeEntity, UUID> {
    ServiceTypeEntity findByServiceTypeIdAndIsDeletedFalse(UUID id);
    ServiceTypeEntity findByServiceTypeIdAndIsDeletedTrue(UUID id);
    List<ServiceTypeEntity> findByParentServiceTypeIdAndIsDeletedFalse(UUID id);
    List<ServiceTypeEntity> findByParentServiceTypeIdAndIsDeletedTrue(UUID id);
    boolean existsByServiceNameIgnoreCaseAndIsDeletedFalse(String serviceName);
    Page<ServiceTypeEntity> findByIsDeletedFalse(Pageable pageable);
    Page<ServiceTypeEntity> findByServiceNameContainingIgnoreCaseAndIsDeletedFalse(String search, Pageable pageable);

}
