package com.fpt.evcare.repository;

import com.fpt.evcare.entity.WarrantyPackageEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface WarrantyPackageRepository extends JpaRepository<WarrantyPackageEntity, UUID> {
    
    Optional<WarrantyPackageEntity> findByWarrantyPackageIdAndIsDeletedFalse(UUID id);
    
    Optional<WarrantyPackageEntity> findByWarrantyPackageIdAndIsDeletedTrue(UUID id);
    
    Page<WarrantyPackageEntity> findAllByIsDeletedFalse(Pageable pageable);
    
    Page<WarrantyPackageEntity> findBySearchContainingIgnoreCaseAndIsDeletedFalse(String keyword, Pageable pageable);
    
    boolean existsByWarrantyPackageNameAndIsDeletedFalse(String warrantyPackageName);
    
    @Query(value = """
        SELECT wp.* 
        FROM warranty_packages wp
        WHERE wp.is_deleted = FALSE
          AND wp.is_active = TRUE
          AND (CAST(:keyword AS VARCHAR) IS NULL OR CAST(:keyword AS VARCHAR) = '' OR LOWER(COALESCE(wp.search, '')) LIKE LOWER(CONCAT('%', CAST(:keyword AS VARCHAR), '%')))
          AND (CAST(:isValid AS BOOLEAN) IS NULL OR CAST(:isValid AS BOOLEAN) = FALSE OR 
               (wp.start_date IS NOT NULL AND wp.end_date IS NOT NULL 
                AND wp.start_date <= CURRENT_TIMESTAMP AND wp.end_date >= CURRENT_TIMESTAMP))
        ORDER BY wp.warranty_package_name ASC
        """, 
        countQuery = """
        SELECT COUNT(*) 
        FROM warranty_packages wp
        WHERE wp.is_deleted = FALSE
          AND wp.is_active = TRUE
          AND (CAST(:keyword AS VARCHAR) IS NULL OR CAST(:keyword AS VARCHAR) = '' OR LOWER(COALESCE(wp.search, '')) LIKE LOWER(CONCAT('%', CAST(:keyword AS VARCHAR), '%')))
          AND (CAST(:isValid AS BOOLEAN) IS NULL OR CAST(:isValid AS BOOLEAN) = FALSE OR 
               (wp.start_date IS NOT NULL AND wp.end_date IS NOT NULL 
                AND wp.start_date <= CURRENT_TIMESTAMP AND wp.end_date >= CURRENT_TIMESTAMP))
        """, nativeQuery = true)
    Page<WarrantyPackageEntity> findWarrantyPackagesWithFilters(
            @Param("keyword") String keyword,
            @Param("isValid") Boolean isValid,
            Pageable pageable);
}

