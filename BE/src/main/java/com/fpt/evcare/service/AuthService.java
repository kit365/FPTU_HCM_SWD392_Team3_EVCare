package com.fpt.evcare.service;

import com.fpt.evcare.dto.request.LoginRequest;
import com.fpt.evcare.dto.request.user.RegisterUserRequest;
import com.fpt.evcare.dto.response.LoginResponse;
import com.fpt.evcare.dto.response.RegisterUserResponse;
import com.nimbusds.jose.JOSEException;

public interface AuthService {
    LoginResponse login(LoginRequest loginRequest) throws JOSEException;
    String generateToken(String email) throws JOSEException;
    RegisterUserResponse registerUser(RegisterUserRequest registerUserRequest) throws JOSEException;
}
