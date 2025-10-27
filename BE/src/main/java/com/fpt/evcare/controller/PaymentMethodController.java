package com.fpt.evcare.controller;

import com.fpt.evcare.base.ApiResponse;
import com.fpt.evcare.constants.PaymentMethodConstants;
import com.fpt.evcare.dto.request.payment_method.CreationPaymentMethodRequest;
import com.fpt.evcare.dto.request.payment_method.UpdationPaymentMethodRequest;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.dto.response.PaymentMethodResponse;
import com.fpt.evcare.service.PaymentMethodService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@AllArgsConstructor
@Slf4j
@RequestMapping("/api/payment-methods")
public class PaymentMethodController {
    PaymentMethodService paymentMethodService;

    @Operation(summary = "Lấy danh sách phương thức thanh toán của user")
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<PageResponse<PaymentMethodResponse>>> getUserPaymentMethods(
            @PathVariable("userId") UUID userId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        PageResponse<PaymentMethodResponse> response = paymentMethodService.getPaymentMethodsByUserId(userId, pageable);
        return ResponseEntity
                .ok(ApiResponse.<PageResponse<PaymentMethodResponse>>builder()
                        .success(true)
                        .message(PaymentMethodConstants.MESSAGE_SUCCESS_SHOWING_USER_PAYMENT_METHODS)
                        .data(response)
                        .build()
                );
    }

    @Operation(summary = "Lấy thông tin phương thức thanh toán theo ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentMethodResponse>> getPaymentMethodById(@PathVariable("id") UUID id) {
        PaymentMethodResponse response = paymentMethodService.getPaymentMethodById(id);
        return ResponseEntity
                .ok(ApiResponse.<PaymentMethodResponse>builder()
                        .success(true)
                        .message(PaymentMethodConstants.MESSAGE_SUCCESS_SHOWING_PAYMENT_METHOD)
                        .data(response)
                        .build()
                );
    }

    @Operation(summary = "Tạo mới phương thức thanh toán")
    @PostMapping
    public ResponseEntity<ApiResponse<PaymentMethodResponse>> createPaymentMethod(
            @Valid @RequestBody CreationPaymentMethodRequest request) {
        PaymentMethodResponse response = paymentMethodService.addPaymentMethod(request);
        return ResponseEntity
                .ok(ApiResponse.<PaymentMethodResponse>builder()
                        .success(true)
                        .message(PaymentMethodConstants.MESSAGE_SUCCESS_CREATING_PAYMENT_METHOD)
                        .data(response)
                        .build()
                );
    }

    @Operation(summary = "Cập nhật phương thức thanh toán")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> updatePaymentMethod(
            @PathVariable("id") UUID id,
            @Valid @RequestBody UpdationPaymentMethodRequest request) {
        paymentMethodService.updatePaymentMethod(id, request);
        return ResponseEntity
                .ok(ApiResponse.<String>builder()
                        .success(true)
                        .message(PaymentMethodConstants.MESSAGE_SUCCESS_UPDATING_PAYMENT_METHOD)
                        .data(id.toString())
                        .build()
                );
    }

    @Operation(summary = "Xóa phương thức thanh toán")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deletePaymentMethod(@PathVariable("id") UUID id) {
        paymentMethodService.deletePaymentMethod(id);
        return ResponseEntity
                .ok(ApiResponse.<String>builder()
                        .success(true)
                        .message(PaymentMethodConstants.MESSAGE_SUCCESS_DELETING_PAYMENT_METHOD)
                        .data(id.toString())
                        .build()
                );
    }
}

