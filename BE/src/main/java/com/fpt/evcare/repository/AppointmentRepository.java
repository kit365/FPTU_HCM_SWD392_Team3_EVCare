package com.fpt.evcare.repository;


import com.fpt.evcare.entity.AppointmentEntity;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface AppointmentRepository extends JpaRepository<AppointmentEntity, UUID> {
    AppointmentEntity findByAppointmentIdAndIsDeletedFalse(UUID appointmentId);
    AppointmentEntity findByAppointmentIdAndIsDeletedTrue(UUID appointmentId);
    Page<AppointmentEntity> findByIsDeletedFalse(Pageable pageable);
    Page<AppointmentEntity> findBySearchContainingIgnoreCaseAndIsDeletedFalse(String keyword, Pageable pageable);

    @Query( value = "SELECT a.appointment_id, " +
            "a.customer_id, " +
            "u.full_name, " +
            "u.phone, " +
            "u.email, " +
            "a.customer_full_name, " +
            "a.customer_phone_number, " +
            "a.customer_email, " +
            "a.technician_id, " +
            "a.assignee_id, " +
            "a.service_mode, " +
            "a.status, " +
            "a.user_address, " +
            "a.scheduled_at, " +
            "a.quote_price, " +
            "a.notes, " +
            "a.search " +
            "FROM appointments a " +
            "JOIN users u ON :userType = u.id " +
            "WHERE :userType = :userId " +
            "AND a.is_deleted = FALSE " +
            "AND a.is_active = TRUE " +
            "AND u.is_deleted = FALSE " +
            "AND u.is_active = TRUE",
            nativeQuery = true)
    Page<AppointmentEntity> findByCustomerIdAndIsDeletedFalse(@Param("userId") UUID userId, Pageable pageable, String userType);

    @Query(value = "SELECT EXISTS (" +
            "SELECT 1 " +
            "FROM appointments a " +
            "JOIN appointment_service_types ast ON a.id = ast.appointment_id " +
            "JOIN service_types s ON ast.service_type_id = s.id " +
            "WHERE s.id = :serviceTypeId " +
            "AND a.status IN ('CONFIRMED', 'IN_PROGRESS') " +
            "AND a.is_deleted = FALSE " +
            "AND a.is_active = TRUE " +
            "AND s.is_deleted = FALSE " +
            "AND s.is_active = TRUE)",
            nativeQuery = true)
    boolean existsActiveAppointmentsByServiceTypeId(@Param("serviceTypeId") UUID serviceTypeId);

    @Query(value = "SELECT a.* " +
            "FROM appointments a " +
            "JOIN appointment_service_types ast ON a.id = ast.appointment_id " +
            "WHERE ast.service_type_id = :serviceTypeId " +
            "AND a.status IN ('PENDING', 'COMPLETED')  " +
            "AND a.is_deleted = FALSE " +
            "AND a.is_active = TRUE",
            nativeQuery = true)
    List<AppointmentEntity> findByServiceTypeIdAndStatusPending(@Param("serviceTypeId") UUID serviceTypeId);
}
