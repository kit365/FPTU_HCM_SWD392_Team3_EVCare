package com.fpt.evcare.repository;


import com.fpt.evcare.entity.ServiceTypeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface ServiceTypeRepository extends JpaRepository<ServiceTypeEntity, UUID> {
    ServiceTypeEntity findByServiceNameIgnoreCase(String serviceName);
    boolean existsByServiceNameIgnoreCase(String serviceName);

    @Query("SELECT s FROM ServiceTypeEntity s LEFT JOIN FETCH s.parent WHERE s.isDeleted = false")
    List<ServiceTypeEntity> findByIsDeletedFalseAndIsActiveTrue();

}
