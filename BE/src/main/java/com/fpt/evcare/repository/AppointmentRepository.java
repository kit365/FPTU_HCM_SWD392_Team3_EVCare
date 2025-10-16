package com.fpt.evcare.repository;


import com.fpt.evcare.entity.AppointmentEntity;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;

public interface AppointmentRepository extends JpaRepository<AppointmentEntity, UUID> {
    AppointmentEntity findByAppointmentIdAndIsDeletedFalse(UUID appointmentId);
    Page<AppointmentEntity> findByIsDeletedFalse(Pageable pageable);
    Page<AppointmentEntity> findBySearchContainingIgnoreCaseAndIsDeletedFalse(String keyword, Pageable pageable);

    @Query(value = """
        SELECT a.* 
        FROM appointments a
        JOIN users u ON a.customer_id = u.id
        WHERE a.is_deleted = FALSE
          AND a.is_active = TRUE
          AND u.is_deleted = FALSE
          AND u.is_active = TRUE
          AND a.customer_id = :userId
          AND (
              LOWER(a.search) LIKE LOWER(CONCAT('%', :keyword, '%'))
              OR LOWER(a.customer_full_name) LIKE LOWER(CONCAT('%', :keyword, '%'))
              OR LOWER(a.customer_email) LIKE LOWER(CONCAT('%', :keyword, '%'))
              OR LOWER(a.customer_phone_number) LIKE LOWER(CONCAT('%', :keyword, '%'))
          )
        """, nativeQuery = true)
    Page<AppointmentEntity> findAppointmentsByCustomerAndKeyword(
            @Param("userId") UUID userId,
            @Param("keyword") String keyword,
            Pageable pageable);

}
