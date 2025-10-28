package com.fpt.evcare.controller;

import com.fpt.evcare.base.ApiResponse;
import com.fpt.evcare.dto.request.PaymentRequest;
import com.fpt.evcare.dto.response.InvoiceResponse;
import com.fpt.evcare.service.InvoiceService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/api/v1/invoice")
public class InvoiceController {

    InvoiceService invoiceService;

    @GetMapping("/appointment/{appointmentId}")
    @Operation(
        summary = "Lấy hóa đơn theo appointmentId",
        description = "🔐 **Roles:** ADMIN, STAFF - Lấy thông tin hóa đơn của appointment (phải ở trạng thái PENDING_PAYMENT hoặc COMPLETED)"
    )
//    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<InvoiceResponse>> getInvoiceByAppointmentId(
            @PathVariable UUID appointmentId
    ) {
        log.info("Getting invoice for appointment: {}", appointmentId);
        InvoiceResponse invoice = invoiceService.getInvoiceByAppointmentId(appointmentId);
        
        return ResponseEntity.ok(
                ApiResponse.<InvoiceResponse>builder()
                        .success(true)
                        .message("Lấy thông tin hóa đơn thành công")
                        .data(invoice)
                        .build()
        );
    }

    @PatchMapping("/{invoiceId}/pay-cash")
    @Operation(
        summary = "Thanh toán hóa đơn bằng tiền mặt (CASH)",
        description = """
            🔐 **Roles:** ADMIN, STAFF
            
            Thanh toán hóa đơn bằng tiền mặt và tự động chuyển appointment sang COMPLETED.
            
            **Flow:**
            1. Kiểm tra invoice phải ở trạng thái PENDING
            2. Kiểm tra appointment phải ở trạng thái PENDING_PAYMENT
            3. Cập nhật invoice: payment_method = CASH, status = PAID
            4. Cập nhật appointment: status = COMPLETED
            
            **Request Body:**
            - paidAmount (optional): Số tiền đã thanh toán. Nếu không truyền, mặc định = totalAmount
            - notes (optional): Ghi chú về thanh toán
            """
    )
//    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<Void>> payInvoiceCash(
            @PathVariable UUID invoiceId,
            @RequestBody PaymentRequest paymentRequest
    ) {
        log.info("Processing CASH payment for invoice: {}", invoiceId);
        invoiceService.payCash(invoiceId, paymentRequest);
        
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Thanh toán thành công. Appointment đã chuyển sang trạng thái COMPLETED.")
                        .build()
        );
    }
}

