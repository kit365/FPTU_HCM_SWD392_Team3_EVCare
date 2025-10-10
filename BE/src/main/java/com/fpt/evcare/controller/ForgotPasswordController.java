package com.fpt.evcare.controller;


import com.fpt.evcare.base.ApiResponse;
import com.fpt.evcare.constants.ForgotPasswordConstants;
import com.fpt.evcare.dto.request.RequestOtpRequest;
import com.fpt.evcare.dto.request.ResetPasswordRequest;
import com.fpt.evcare.dto.request.VerifyOtpRequest;
import com.fpt.evcare.dto.response.VerifyOtpResponse;
import com.fpt.evcare.service.ForgotPasswordService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping(ForgotPasswordConstants.BASE_URL)
public class ForgotPasswordController {

    ForgotPasswordService forgotPasswordService;

    @PostMapping(ForgotPasswordConstants.REQUEST_OTP)
    public ResponseEntity<ApiResponse<String>> requestOtp(@Valid @RequestBody RequestOtpRequest request) {
        forgotPasswordService.requestOtp(request.getEmail());
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(true)
                .message(ForgotPasswordConstants.MESSAGE_SUCCESS_FORGOT_PASSWORD_REQUEST)
                .build());
    }


    @PostMapping(ForgotPasswordConstants.VERIFY_OTP)
    public ResponseEntity<ApiResponse<VerifyOtpResponse>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        VerifyOtpResponse response = forgotPasswordService.verifyOtp(request.getEmail(), request.getOtp());
        log.info(response.toString());
        return ResponseEntity.ok(ApiResponse.<VerifyOtpResponse>builder()
                .success(true)
                .message(ForgotPasswordConstants.MESSAGE_SUCCESS_OTP_VERIFIED)
                .data(response)
                .build());
    }


    @PostMapping(ForgotPasswordConstants.RESET_PASSWORD)
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        forgotPasswordService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(true)
                .message(ForgotPasswordConstants.MESSAGE_SUCCESS_PASSWORD_RESET)
                .build());
    }

}
