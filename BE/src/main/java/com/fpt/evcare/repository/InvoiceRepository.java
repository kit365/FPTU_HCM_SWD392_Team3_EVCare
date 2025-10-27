package com.fpt.evcare.repository;

import com.fpt.evcare.entity.AppointmentEntity;
import com.fpt.evcare.entity.InvoiceEntity;
import com.fpt.evcare.entity.UserEntity;
import com.fpt.evcare.enums.InvoiceStatusEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface InvoiceRepository extends JpaRepository<InvoiceEntity, UUID> {
    InvoiceEntity findByInvoiceIdAndIsDeletedFalse(UUID invoiceId);
    
    InvoiceEntity findByInvoiceIdAndIsDeletedTrue(UUID invoiceId);
    
    Page<InvoiceEntity> findByIsDeletedFalse(Pageable pageable);
    
    Page<InvoiceEntity> findBySearchContainingIgnoreCaseAndIsDeletedFalse(String keyword, Pageable pageable);
    
    Page<InvoiceEntity> findByStatusAndIsDeletedFalse(InvoiceStatusEnum status, Pageable pageable);
    
    Page<InvoiceEntity> findByAppointmentAndIsDeletedFalse(AppointmentEntity appointment, Pageable pageable);
    
    List<InvoiceEntity> findByAppointmentAndIsDeletedFalse(AppointmentEntity appointment);

    @Query(value = """
        SELECT i.* 
        FROM invoices i
        JOIN appointments a ON i.appointment_id = a.id
        WHERE i.is_deleted = FALSE
          AND a.is_deleted = FALSE
          AND a.customer_id = :userId
          AND (
              LOWER(i.search) LIKE LOWER(CONCAT('%', :keyword, '%'))
          )
        """, nativeQuery = true)
    Page<InvoiceEntity> findInvoicesByCustomerAndKeyword(
            @Param("userId") UUID userId,
            @Param("keyword") String keyword,
            Pageable pageable);
}
