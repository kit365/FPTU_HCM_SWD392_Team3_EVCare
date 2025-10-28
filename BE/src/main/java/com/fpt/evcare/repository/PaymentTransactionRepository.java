package com.fpt.evcare.repository;

import com.fpt.evcare.entity.InvoiceEntity;
import com.fpt.evcare.entity.PaymentTransactionEntity;
import com.fpt.evcare.enums.PaymentTransactionStatusEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransactionEntity, UUID> {
    
    Optional<PaymentTransactionEntity> findByTransactionReference(String transactionReference);
    
    List<PaymentTransactionEntity> findByInvoiceAndIsDeletedFalse(InvoiceEntity invoice);
    
    Page<PaymentTransactionEntity> findByIsDeletedFalse(Pageable pageable);
    
    Page<PaymentTransactionEntity> findByStatusAndIsDeletedFalse(PaymentTransactionStatusEnum status, Pageable pageable);
    
    @Query("SELECT pt FROM PaymentTransactionEntity pt WHERE pt.invoice.invoiceId = :invoiceId AND pt.isDeleted = false")
    Page<PaymentTransactionEntity> findByInvoiceId(@Param("invoiceId") UUID invoiceId, Pageable pageable);
    
    @Query("SELECT pt FROM PaymentTransactionEntity pt WHERE pt.status = :status AND pt.isDeleted = false")
    Page<PaymentTransactionEntity> findByStatus(@Param("status") PaymentTransactionStatusEnum status, Pageable pageable);

    // Dashboard queries - Sum revenue by date range using appointment scheduled_at
    @Query(value = """
        SELECT COALESCE(SUM(pt.amount), 0.0)
        FROM payment_transactions pt
        JOIN appointments a ON pt.appointment_id = a.id
        WHERE a.scheduled_at BETWEEN :startDate AND :endDate
          AND pt.is_deleted = false
          AND a.is_deleted = false
          AND pt.status = 'SUCCESS'
    """, nativeQuery = true)
    Double sumRevenueByDateRange(@Param("startDate") LocalDateTime startDate, 
                                  @Param("endDate") LocalDateTime endDate);

    // Dashboard queries - Sum revenue by month (last 6 months) using appointment scheduled_at
    @Query(value = """
        SELECT EXTRACT(MONTH FROM a.scheduled_at) AS month,
               COALESCE(SUM(pt.amount), 0.0) AS revenue
        FROM payment_transactions pt
        JOIN appointments a ON pt.appointment_id = a.id
        WHERE a.scheduled_at >= CURRENT_DATE - INTERVAL '6 months'
          AND pt.is_deleted = false
          AND a.is_deleted = false
          AND pt.status = 'SUCCESS'
        GROUP BY EXTRACT(MONTH FROM a.scheduled_at)
        ORDER BY month
    """, nativeQuery = true)
    List<Object[]> sumRevenueByMonth();
}
