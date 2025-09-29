package com.fpt.evcare.service;

import com.fpt.evcare.dto.request.LoginRequest;
import com.fpt.evcare.dto.request.TokenRequest;
import com.fpt.evcare.dto.request.user.CreationUserRequest;
import com.fpt.evcare.dto.request.user.RegisterUserRequest;
import com.fpt.evcare.dto.response.LoginResponse;
import com.fpt.evcare.dto.response.RegisterUserResponse;
import com.fpt.evcare.dto.response.TokenResponse;
import com.nimbusds.jose.JOSEException;

public interface AuthService {
    LoginResponse login(LoginRequest loginRequest) throws JOSEException;
    LoginResponse refreshToken(TokenRequest request) throws JOSEException;

    RegisterUserResponse registerUser(RegisterUserRequest registerUserRequest) throws JOSEException;
    TokenResponse validateToken(TokenRequest token);
    void logout(CreationUserRequest user);
}
