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
            "JOIN appointment_service_type_vehicle_parts astvp ON a.id = astvp.appointment_id " +
            "JOIN service_types_vehicle_parts stvp ON astvp.service_types_vehicle_parts_id = stvp.id " +
            "WHERE stvp.id = :serviceTypeVehiclePartId " +
            "AND a.status IN ('PENDING', 'COMPLETED') " +
            "AND a.is_deleted = FALSE " +
            "AND a.is_active = TRUE " +
            "AND stvp.is_deleted = FALSE " +
            "AND stvp.is_active = TRUE) ",
            nativeQuery = true)
    List<AppointmentEntity> getUnactiveAppointmentListInServiceTypeVehiclePartId(@Param("serviceTypeVehiclePartId") UUID uuid);

}
