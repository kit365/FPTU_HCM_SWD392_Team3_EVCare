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
}
