package com.fpt.evcare.serviceimpl;

import com.fpt.evcare.dto.request.payment.CreatePaymentRequest;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.dto.response.PaymentResponse;
import com.fpt.evcare.entity.*;
import com.fpt.evcare.enums.InvoiceStatusEnum;
import com.fpt.evcare.enums.PaymentGatewayEnum;
import com.fpt.evcare.enums.PaymentTransactionStatusEnum;
import com.fpt.evcare.exception.ResourceNotFoundException;
import com.fpt.evcare.repository.*;
import com.fpt.evcare.service.PaymentService;
import com.fpt.evcare.utils.UtilFunction;
import com.fpt.evcare.util.VnpayUtil;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Service
public class PaymentServiceImpl implements PaymentService {
    
    final PaymentTransactionRepository paymentTransactionRepository;
    final InvoiceRepository invoiceRepository;
    
    @Value("${payment.vnpay.tmn-code}")
    String vnpayTmnCode;
    
    @Value("${payment.vnpay.hash-secret}")
    String vnpayHashSecret;
    
    @Value("${payment.vnpay.url}")
    String vnpayUrl;
    
    @Value("${payment.vnpay.return-url}")
    String vnpayReturnUrl;
    
    @Override
    @Transactional
    public PaymentResponse createPayment(CreatePaymentRequest request) {
        log.info("Creating payment for invoice: {} via gateway: {}", request.getInvoiceId(), request.getGateway());
        
        // Validate invoice
        InvoiceEntity invoice = null;
        if (request.getInvoiceId() != null) {
            invoice = invoiceRepository.findByInvoiceIdAndIsDeletedFalse(request.getInvoiceId());
            if (invoice == null) {
                throw new ResourceNotFoundException("Invoice not found");
            }
        }
        
        // Generate unique transaction reference
        String transactionReference = "INV" + System.currentTimeMillis();
        
        // Create payment transaction
        PaymentTransactionEntity transaction = PaymentTransactionEntity.builder()
                .invoice(invoice)
                .gateway(request.getGateway())
                .amount(request.getAmount())
                .currency(request.getCurrency() != null ? request.getCurrency() : "VND")
                .transactionReference(transactionReference)
                .status(PaymentTransactionStatusEnum.PENDING)
                .customerInfo(request.getCustomerInfo())
                .search(buildSearchField(transactionReference, request.getCustomerInfo()))
                .build();
        
        PaymentTransactionEntity savedTransaction = paymentTransactionRepository.save(transaction);
        
        // Generate payment URL based on gateway
        String paymentUrl = null;
        if (request.getGateway() == PaymentGatewayEnum.VNPAY) {
            paymentUrl = generateVnpayUrl(savedTransaction, invoice, request);
            savedTransaction.setPaymentUrl(paymentUrl);
            paymentTransactionRepository.save(savedTransaction);
        } 
        // Temporarily disabled - Only VNPay is enabled for testing
        // else if (request.getGateway() == PaymentGatewayEnum.MOMO) {
        //     paymentUrl = generateMomoUrl(savedTransaction, invoice, request);
        //     savedTransaction.setPaymentUrl(paymentUrl);
        //     paymentTransactionRepository.save(savedTransaction);
        // }
        
        return mapToResponse(savedTransaction);
    }
    
    private String generateVnpayUrl(PaymentTransactionEntity transaction, InvoiceEntity invoice, CreatePaymentRequest request) {
        String vnp_TxnRef = transaction.getTransactionReference();
        String vnp_OrderInfo = request.getOrderDescription() != null ? request.getOrderDescription() : "Thanh toan hoa don " + vnp_TxnRef;
        long amount = request.getAmount().multiply(new BigDecimal("100")).longValue();
        
        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", vnpayTmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", vnp_OrderInfo);
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnpayReturnUrl);
        
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        String vnp_CreateDate = new SimpleDateFormat("yyyyMMddHHmmss").format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
        
        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = new SimpleDateFormat("yyyyMMddHHmmss").format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);
        
        String vnp_SecureHash = VnpayUtil.createHash(vnpayHashSecret, vnp_Params);
        vnp_Params.put("vnp_SecureHash", vnp_SecureHash);
        
        String queryUrl = vnpayUrl + "?" + VnpayUtil.buildQueryUrl(vnp_Params);
        return queryUrl;
    }
    
    private String generateMomoUrl(PaymentTransactionEntity transaction, InvoiceEntity invoice, CreatePaymentRequest request) {
        // MoMo implementation would go here
        // For now, return a placeholder
        return "https://test-payment.momo.vn/v2/gateway/api/create";
    }
    
    @Override
    @Transactional
    public boolean handleVnpayCallback(String vnp_Amount, String vnp_BankCode, String vnp_BankTranNo,
                                      String vnp_CardType, String vnp_OrderInfo, String vnp_PayDate,
                                      String vnp_ResponseCode, String vnp_TmnCode, String vnp_TransactionNo,
                                      String vnp_TransactionStatus, String vnp_TxnRef, String vnp_SecureHash) {
        
        log.info("Handling VNPay callback for transaction: {}", vnp_TxnRef);
        
        PaymentTransactionEntity transaction = paymentTransactionRepository.findByTransactionReference(vnp_TxnRef)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        
        // Verify hash
        Map<String, String> params = new HashMap<>();
        params.put("vnp_Amount", vnp_Amount);
        params.put("vnp_BankCode", vnp_BankCode);
        params.put("vnp_BankTranNo", vnp_BankTranNo);
        params.put("vnp_CardType", vnp_CardType);
        params.put("vnp_OrderInfo", vnp_OrderInfo);
        params.put("vnp_PayDate", vnp_PayDate);
        params.put("vnp_ResponseCode", vnp_ResponseCode);
        params.put("vnp_TmnCode", vnp_TmnCode);
        params.put("vnp_TransactionNo", vnp_TransactionNo);
        params.put("vnp_TransactionStatus", vnp_TransactionStatus);
        params.put("vnp_TxnRef", vnp_TxnRef);
        
        String verifyCode = VnpayUtil.verifyHash(vnpayHashSecret, params, vnp_SecureHash);
        
        if ("00".equals(vnp_ResponseCode) && "00".equals(verifyCode)) {
            transaction.setStatus(PaymentTransactionStatusEnum.SUCCESS);
            transaction.setGatewayTransactionId(vnp_TransactionNo);
            transaction.setPaymentDate(LocalDateTime.now());
            transaction.setTransactionResponse("Success");
            
            // Update invoice
            if (transaction.getInvoice() != null) {
                InvoiceEntity invoice = transaction.getInvoice();
                invoice.setPaidAmount(invoice.getTotalAmount());
                invoice.setStatus(InvoiceStatusEnum.PAID);
                invoiceRepository.save(invoice);
            }
        } else {
            transaction.setStatus(PaymentTransactionStatusEnum.FAILED);
            transaction.setTransactionResponse("Failed: " + vnp_ResponseCode);
        }
        
        paymentTransactionRepository.save(transaction);
        return true;
    }
    
    @Override
    @Transactional
    public boolean handleMomoCallback(String partnerCode, String orderId, String requestId,
                                     String amount, String resultCode, String transId,
                                     String payType, String signature) {
        // MoMo callback handling
        return true;
    }
    
    @Override
    @Transactional
    public PaymentResponse checkPaymentStatus(UUID transactionId) {
        PaymentTransactionEntity transaction = paymentTransactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        return mapToResponse(transaction);
    }
    
    @Override
    @Transactional
    public PageResponse<PaymentResponse> getPaymentHistoryByInvoice(UUID invoiceId, Pageable pageable) {
        Page<PaymentTransactionEntity> transactions = paymentTransactionRepository.findByInvoiceId(invoiceId, pageable);
        return buildPageResponse(transactions);
    }
    
    @Override
    @Transactional
    public PageResponse<PaymentResponse> getAllPaymentHistory(Pageable pageable) {
        Page<PaymentTransactionEntity> transactions = paymentTransactionRepository.findByIsDeletedFalse(pageable);
        return buildPageResponse(transactions);
    }
    
    private PaymentResponse mapToResponse(PaymentTransactionEntity transaction) {
        return PaymentResponse.builder()
                .transactionId(transaction.getTransactionId())
                .invoiceId(transaction.getInvoice() != null ? transaction.getInvoice().getInvoiceId() : null)
                .appointmentId(transaction.getAppointment() != null ? transaction.getAppointment().getAppointmentId() : null)
                .gateway(transaction.getGateway())
                .amount(transaction.getAmount())
                .currency(transaction.getCurrency())
                .transactionReference(transaction.getTransactionReference())
                .paymentUrl(transaction.getPaymentUrl())
                .status(transaction.getStatus())
                .createdAt(transaction.getCreatedAt())
                .paymentDate(transaction.getPaymentDate())
                .gatewayTransactionId(transaction.getGatewayTransactionId())
                .customerInfo(transaction.getCustomerInfo())
                .build();
    }
    
    private String buildSearchField(String transactionReference, String customerInfo) {
        return UtilFunction.concatenateSearchField(transactionReference, customerInfo);
    }
    
    private PageResponse<PaymentResponse> buildPageResponse(Page<PaymentTransactionEntity> transactionPage) {
        List<PaymentResponse> responses = transactionPage.map(this::mapToResponse).getContent();
        return PageResponse.<PaymentResponse>builder()
                .data(responses)
                .page(transactionPage.getNumber())
                .totalElements(transactionPage.getTotalElements())
                .totalPages(transactionPage.getTotalPages())
                .build();
    }
}
