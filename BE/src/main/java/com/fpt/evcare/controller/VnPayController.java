package com.fpt.evcare.controller;

import com.fpt.evcare.base.ApiResponse;
import com.fpt.evcare.service.VnPayService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/vnpay")
public class VnPayController {

    private final VnPayService vnPayService;
    
    @Value("${frontend.url:http://localhost:5000}")
    private String frontendUrl;

    /**
     * Tạo payment URL cho VNPay
     */
    @GetMapping("/create-payment")
    @Operation(
        summary = "Tạo URL thanh toán VNPay",
        description = """
            Tạo URL thanh toán VNPay cho appointment.
            
            **Flow:**
            1. Kiểm tra appointment phải ở trạng thái PENDING_PAYMENT
            2. Kiểm tra invoice phải ở trạng thái PENDING
            3. Tạo payment URL và PaymentTransaction
            4. Trả về payment URL để frontend redirect hoặc hiển thị QR code
            
            **Query Parameter:**
            - appointmentId: UUID của appointment cần thanh toán
            - source: "admin" hoặc "client" (optional, mặc định là "client")
            """
    )
    public ResponseEntity<ApiResponse<String>> createPayment(
            @RequestParam("appointmentId") UUID appointmentId,
            @RequestParam(value = "source", defaultValue = "client") String source,
            HttpServletRequest request
    ) {
        try {
            log.info("Creating VNPay payment URL for appointment: {}, source: {}", appointmentId, source);
            String paymentUrl = vnPayService.createPayment(appointmentId.toString(), source, request);
            
            return ResponseEntity.ok(
                    ApiResponse.<String>builder()
                            .success(true)
                            .message("Tạo URL thanh toán thành công")
                            .data(paymentUrl)
                            .build()
            );
        } catch (Exception e) {
            log.error("Error creating VNPay payment URL: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(
                    ApiResponse.<String>builder()
                            .success(false)
                            .message(e.getMessage())
                            .build()
            );
        }
    }

    /**
     * VNPay callback (IPN)
     */
    @GetMapping("/payment-return")
    @Operation(summary = "VNPay callback URL", description = "URL callback từ VNPay sau khi thanh toán")
    public ResponseEntity<?> paymentReturn(@RequestParam Map<String, String> params, HttpServletRequest request) {
        try {
            log.info("Received VNPay callback with params: {}", params.keySet());
            String transactionReference = vnPayService.handleIPN(params, request);
            
            // Lấy source từ PaymentTransaction để biết redirect về admin hay client
            String source = vnPayService.getSourceFromTransaction(transactionReference);
            
            // Kiểm tra mã giao dịch hợp lệ
            String transactionStatus = params.get("vnp_TransactionStatus");
            if ("00".equals(transactionStatus) && transactionReference != null) {
                // Lấy appointmentId từ transaction để redirect đúng
                String appointmentIdStr = vnPayService.getAppointmentIdFromTransaction(transactionReference);
                
                // Success: 
                // - Nếu source=admin: Khách quét QR trên điện thoại → redirect về trang thông báo đơn giản
                // - Máy tính admin sẽ tự detect qua polling và navigate
                // - Nếu source=client: redirect về client success page với appointmentId
                if ("admin".equals(source)) {
                    // Redirect về trang thông báo đơn giản (không phải admin page)
                    // Vì redirect này xảy ra trên điện thoại khách, không phải máy tính admin
                    return ResponseEntity.status(HttpStatus.FOUND)
                            .location(URI.create(frontendUrl + "/payment/success-message"))
                            .build();
                } else {
                    // Redirect với appointmentId để frontend có thể fetch invoice
                    String redirectUrl = frontendUrl + "/client/payment/success";
                    if (appointmentIdStr != null) {
                        redirectUrl += "?appointmentId=" + appointmentIdStr;
                    }
                    return ResponseEntity.status(HttpStatus.FOUND)
                            .location(URI.create(redirectUrl))
                            .build();
                }
            } else {
                // Failed: redirect về frontend fail page
                if ("admin".equals(source)) {
                    // Redirect về trang thông báo đơn giản cho khách
                    return ResponseEntity.status(HttpStatus.FOUND)
                            .location(URI.create(frontendUrl + "/payment/fail-message"))
                            .build();
                } else {
                    return ResponseEntity.status(HttpStatus.FOUND)
                            .location(URI.create(frontendUrl + "/client/payment/fail"))
                            .build();
                }
            }
        } catch (Exception e) {
            log.error("Error processing VNPay callback: {}", e.getMessage(), e);
            // Default to client page on error
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create(frontendUrl + "/client/payment/fail?error=" + 
                            URLEncoder.encode(e.getMessage(), StandardCharsets.UTF_8)))
                    .build();
        }
    }
}

