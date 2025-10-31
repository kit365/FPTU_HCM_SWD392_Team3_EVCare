package com.fpt.evcare.controller;

import com.fpt.evcare.dto.request.payment.CreatePaymentRequest;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.dto.response.PaymentResponse;
import com.fpt.evcare.service.PaymentService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/payment")
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@CrossOrigin(origins = "*")
public class PaymentController {
    
    PaymentService paymentService;
    
    /**
     * Tạo payment URL
     */
    @PostMapping("/create")
    public ResponseEntity<?> createPayment(@RequestBody CreatePaymentRequest request) {
        try {
            PaymentResponse response = paymentService.createPayment(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating payment: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error creating payment: " + e.getMessage());
        }
    }
    
    /**
     * VNPay callback
     */
    @GetMapping("/vnpay/callback")
    public ResponseEntity<?> vnpayCallback(
            @RequestParam(required = false) String vnp_Amount,
            @RequestParam(required = false) String vnp_BankCode,
            @RequestParam(required = false) String vnp_BankTranNo,
            @RequestParam(required = false) String vnp_CardType,
            @RequestParam(required = false) String vnp_OrderInfo,
            @RequestParam(required = false) String vnp_PayDate,
            @RequestParam(required = false) String vnp_ResponseCode,
            @RequestParam(required = false) String vnp_TmnCode,
            @RequestParam(required = false) String vnp_TransactionNo,
            @RequestParam(required = false) String vnp_TransactionStatus,
            @RequestParam(required = false) String vnp_TxnRef,
            @RequestParam(required = false) String vnp_SecureHash) {
        
        log.info("Received VNPay callback for transaction: {}", vnp_TxnRef);
        
        try {
            boolean success = paymentService.handleVnpayCallback(
                    vnp_Amount, vnp_BankCode, vnp_BankTranNo, vnp_CardType, vnp_OrderInfo,
                    vnp_PayDate, vnp_ResponseCode, vnp_TmnCode, vnp_TransactionNo,
                    vnp_TransactionStatus, vnp_TxnRef, vnp_SecureHash
            );
            
            if (success) {
                return ResponseEntity.ok("Payment processed successfully");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Payment failed");
            }
        } catch (Exception e) {
            log.error("Error processing VNPay callback: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error processing payment");
        }
    }
    
    /**
     * Check payment status
     */
    @GetMapping("/status/{transactionId}")
    public ResponseEntity<?> checkPaymentStatus(@PathVariable UUID transactionId) {
        try {
            PaymentResponse response = paymentService.checkPaymentStatus(transactionId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error checking payment status: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error checking payment status: " + e.getMessage());
        }
    }
    
    /**
     * Get payment history by invoice
     */
    @GetMapping("/invoice/{invoiceId}")
    public ResponseEntity<?> getPaymentHistoryByInvoice(
            @PathVariable UUID invoiceId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        
        try {
            Pageable pageable = PageRequest.of(page, size, 
                    Sort.by(sortDir.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC, sortBy));
            
            PageResponse<PaymentResponse> response = paymentService.getPaymentHistoryByInvoice(invoiceId, pageable);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting payment history: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error getting payment history: " + e.getMessage());
        }
    }
    
    /**
     * Get all payment history
     */
    @GetMapping("/history")
    public ResponseEntity<?> getAllPaymentHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        
        try {
            Pageable pageable = PageRequest.of(page, size, 
                    Sort.by(sortDir.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC, sortBy));
            
            PageResponse<PaymentResponse> response = paymentService.getAllPaymentHistory(pageable);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting payment history: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error getting payment history: " + e.getMessage());
        }
    }
}
