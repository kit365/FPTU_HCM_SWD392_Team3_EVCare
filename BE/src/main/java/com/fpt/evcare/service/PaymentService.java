package com.fpt.evcare.service;

import com.fpt.evcare.dto.request.payment.CreatePaymentRequest;
import com.fpt.evcare.dto.response.PaymentResponse;
import com.fpt.evcare.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface PaymentService {
    
    /**
     * Tạo payment URL từ VNPay hoặc MoMo
     */
    PaymentResponse createPayment(CreatePaymentRequest request);
    
    /**
     * Xử lý callback từ VNPay sau khi thanh toán
     */
    boolean handleVnpayCallback(String vnp_Amount, String vnp_BankCode, String vnp_BankTranNo,
                               String vnp_CardType, String vnp_OrderInfo, String vnp_PayDate,
                               String vnp_ResponseCode, String vnp_TmnCode, String vnp_TransactionNo,
                               String vnp_TransactionStatus, String vnp_TxnRef, String vnp_SecureHash);
    
    /**
     * Xử lý callback từ MoMo sau khi thanh toán
     */
    boolean handleMomoCallback(String partnerCode, String orderId, String requestId,
                               String amount, String resultCode, String transId,
                               String payType, String signature);
    
    /**
     * Kiểm tra trạng thái thanh toán
     */
    PaymentResponse checkPaymentStatus(UUID transactionId);
    
    /**
     * Lấy lịch sử giao dịch theo invoice
     */
    PageResponse<PaymentResponse> getPaymentHistoryByInvoice(UUID invoiceId, Pageable pageable);
    
    /**
     * Lấy lịch sử giao dịch
     */
    PageResponse<PaymentResponse> getAllPaymentHistory(Pageable pageable);
}
