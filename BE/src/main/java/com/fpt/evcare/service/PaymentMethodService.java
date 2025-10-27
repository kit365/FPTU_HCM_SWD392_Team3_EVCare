package com.fpt.evcare.service;

import com.fpt.evcare.dto.request.payment_method.CreationPaymentMethodRequest;
import com.fpt.evcare.dto.request.payment_method.UpdationPaymentMethodRequest;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.dto.response.PaymentMethodResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface PaymentMethodService {
    PaymentMethodResponse getPaymentMethodById(UUID id);
    
    PageResponse<PaymentMethodResponse> searchPaymentMethod(Pageable pageable);
    
    PageResponse<PaymentMethodResponse> getPaymentMethodsByUserId(UUID userId, Pageable pageable);
    
    PaymentMethodResponse addPaymentMethod(CreationPaymentMethodRequest creationPaymentMethodRequest);
    
    boolean updatePaymentMethod(UUID id, UpdationPaymentMethodRequest updationPaymentMethodRequest);
    
    boolean deletePaymentMethod(UUID id);
    
    boolean restorePaymentMethod(UUID id);
}
