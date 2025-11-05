package com.fpt.evcare.repository;

import com.fpt.evcare.entity.CustomerWarrantyPartEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CustomerWarrantyPartRepository extends JpaRepository<CustomerWarrantyPartEntity, UUID> {

    /**
     * Tìm warranty của customer cho một phụ tùng cụ thể
     * Matching theo customer_id hoặc email + phone (khách vãng lai)
     */
    @Query(value = """
        SELECT cwp.* 
        FROM customer_warranty_parts cwp
        WHERE cwp.is_deleted = FALSE
          AND cwp.is_active = TRUE
          AND cwp.vehicle_part_id = :vehiclePartId
          AND (
              -- Match theo customer_id nếu có
              (:customerId IS NOT NULL AND cwp.customer_id = :customerId)
              OR
              -- Match theo email VÀ phone nếu không có customer_id (khách vãng lai)
              (
                  :customerId IS NULL 
                  AND cwp.customer_id IS NULL
                  AND (:customerEmail IS NOT NULL AND :customerEmail != '' 
                       AND LOWER(cwp.customer_email) = LOWER(:customerEmail))
                  AND (:customerPhoneNumber IS NOT NULL AND :customerPhoneNumber != '' 
                       AND cwp.customer_phone_number = :customerPhoneNumber)
              )
          )
          AND cwp.warranty_end_date >= :currentDate
        ORDER BY cwp.warranty_start_date DESC
        LIMIT 1
        """, nativeQuery = true)
    Optional<CustomerWarrantyPartEntity> findActiveWarrantyByCustomerAndVehiclePart(
            @Param("customerId") UUID customerId,
            @Param("customerEmail") String customerEmail,
            @Param("customerPhoneNumber") String customerPhoneNumber,
            @Param("vehiclePartId") UUID vehiclePartId,
            @Param("currentDate") LocalDateTime currentDate);

    /**
     * Tìm tất cả warranty còn hiệu lực của customer
     */
    @Query(value = """
        SELECT cwp.* 
        FROM customer_warranty_parts cwp
        WHERE cwp.is_deleted = FALSE
          AND cwp.is_active = TRUE
          AND (
              (:customerId IS NOT NULL AND cwp.customer_id = :customerId)
              OR
              (
                  :customerId IS NULL 
                  AND cwp.customer_id IS NULL
                  AND (:customerEmail IS NOT NULL AND :customerEmail != '' 
                       AND LOWER(cwp.customer_email) = LOWER(:customerEmail))
                  AND (:customerPhoneNumber IS NOT NULL AND :customerPhoneNumber != '' 
                       AND cwp.customer_phone_number = :customerPhoneNumber)
              )
          )
          AND cwp.warranty_end_date >= :currentDate
        ORDER BY cwp.warranty_start_date DESC
        """, nativeQuery = true)
    List<CustomerWarrantyPartEntity> findAllActiveWarrantiesByCustomer(
            @Param("customerId") UUID customerId,
            @Param("customerEmail") String customerEmail,
            @Param("customerPhoneNumber") String customerPhoneNumber,
            @Param("currentDate") LocalDateTime currentDate);

    /**
     * Tìm warranty theo appointment
     */
    List<CustomerWarrantyPartEntity> findByAppointmentAppointmentIdAndIsDeletedFalse(UUID appointmentId);
}

