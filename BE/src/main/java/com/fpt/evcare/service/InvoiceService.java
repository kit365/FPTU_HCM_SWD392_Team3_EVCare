package com.fpt.evcare.service;

import com.fpt.evcare.dto.request.invoice.CreationInvoiceRequest;
import com.fpt.evcare.dto.request.invoice.UpdationInvoiceRequest;
import com.fpt.evcare.dto.response.InvoiceResponse;
import com.fpt.evcare.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.UUID;

public interface InvoiceService {
    InvoiceResponse getInvoiceById(UUID id);
    
    PageResponse<InvoiceResponse> searchInvoice(String keyword, Pageable pageable);
    
    PageResponse<InvoiceResponse> getInvoicesByCustomerId(UUID customerId, String keyword, Pageable pageable);
    
    InvoiceResponse addInvoice(CreationInvoiceRequest creationInvoiceRequest);
    
    boolean updateInvoice(UUID id, UpdationInvoiceRequest updationInvoiceRequest);
    
    boolean processCashPayment(UUID id, BigDecimal paidAmount);
    
    boolean deleteInvoice(UUID id);
    
    boolean restoreInvoice(UUID id);
}
