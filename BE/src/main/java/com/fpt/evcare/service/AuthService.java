package com.fpt.evcare.service;

import com.fpt.evcare.dto.request.LoginRequest;
import com.fpt.evcare.dto.request.LogoutRequest;
import com.fpt.evcare.dto.request.TokenRequest;
import com.fpt.evcare.dto.request.user.RegisterUserRequest;
import com.fpt.evcare.dto.response.LoginResponse;
import com.fpt.evcare.dto.response.RegisterUserResponse;
import com.fpt.evcare.dto.response.TokenResponse;
import com.fpt.evcare.dto.response.UserResponse;
import com.nimbusds.jose.JOSEException;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Map;

public interface AuthService {
    LoginResponse login(LoginRequest loginRequest) throws JOSEException;
    LoginResponse refreshToken(TokenRequest request) throws JOSEException;

    RegisterUserResponse registerUser(RegisterUserRequest registerUserRequest) throws JOSEException;
    TokenResponse validateToken(TokenRequest token);
    String logout(LogoutRequest user);
    UserResponse getUserByToken(TokenRequest token);
    Map<String, Object> getUserInfo(OAuth2User principal, OAuth2AuthorizedClient authorizedClient);
}
