package com.fpt.evcare.service;

import com.fpt.evcare.dto.request.invoice.CreationInvoiceRequest;
import com.fpt.evcare.dto.request.invoice.UpdationInvoiceRequest;
import com.fpt.evcare.dto.request.PaymentRequest;
import com.fpt.evcare.dto.response.InvoiceResponse;
import com.fpt.evcare.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.UUID;

public interface InvoiceService {
    /**
     * Lấy invoice theo appointmentId
     */
    InvoiceResponse getInvoiceByAppointmentId(UUID appointmentId);
    
//    PageResponse<InvoiceResponse> searchInvoice(String keyword, Pageable pageable);
//
//    PageResponse<InvoiceResponse> getInvoicesByCustomerId(UUID customerId, String keyword, Pageable pageable);
//
//    InvoiceResponse addInvoice(CreationInvoiceRequest creationInvoiceRequest);
//
//    boolean updateInvoice(UUID id, UpdationInvoiceRequest updationInvoiceRequest);
//
//    boolean processCashPayment(UUID id, BigDecimal paidAmount);
    
    /**
     * Thanh toán invoice bằng CASH với PaymentRequest
     */
    boolean payCash(UUID invoiceId, PaymentRequest paymentRequest);

}
