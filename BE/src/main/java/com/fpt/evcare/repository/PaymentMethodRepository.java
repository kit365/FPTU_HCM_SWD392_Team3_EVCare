package com.fpt.evcare.repository;

import com.fpt.evcare.entity.PaymentMethodEntity;
import com.fpt.evcare.entity.UserEntity;
import com.fpt.evcare.enums.MethodTypeEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentMethodRepository extends JpaRepository<PaymentMethodEntity, UUID> {
    PaymentMethodEntity findByPaymentMethodIdAndIsDeletedFalse(UUID paymentMethodId);
    
    PaymentMethodEntity findByPaymentMethodIdAndIsDeletedTrue(UUID paymentMethodId);
    
    Page<PaymentMethodEntity> findByIsDeletedFalse(Pageable pageable);
    
    Page<PaymentMethodEntity> findByUserAndIsDeletedFalse(UserEntity user, Pageable pageable);
    
    List<PaymentMethodEntity> findByUserAndIsDeletedFalse(UserEntity user);
    
    Optional<PaymentMethodEntity> findByUserAndIsDefaultTrueAndIsDeletedFalse(UserEntity user);
    
    boolean existsByAccountNumberAndIsDeletedFalse(String accountNumber);

    Optional<PaymentMethodEntity> findByMethodTypeAndIsDeletedFalse(MethodTypeEnum methodTypeEnum);
}
