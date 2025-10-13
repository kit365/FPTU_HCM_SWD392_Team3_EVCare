package com.fpt.evcare.service;

import com.fpt.evcare.dto.request.ResetPasswordRequest;
import com.fpt.evcare.dto.response.VerifyOtpResponse;

public interface ForgotPasswordService {
    String generateOtp();

    void requestOtp(String email);

    VerifyOtpResponse verifyOtp(String email, String otp);

    void resetPassword(ResetPasswordRequest request);


    // Redis Otp
    String getKeyOtpRedis(String email);

    String getRequestedOtpStatusKey(String email); //
    // check otp active
    boolean hasActiveOtp(String email);

    // validate otp
    boolean validateOtp(String email, String otp);


    // consume otp
    boolean consumeOtp(String email, String otp);


}
