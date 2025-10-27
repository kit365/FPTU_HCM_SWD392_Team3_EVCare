package com.fpt.evcare.service;

import com.fpt.evcare.dto.request.TokenRequest;
import com.fpt.evcare.dto.response.LoginResponse;
import com.fpt.evcare.dto.response.TokenResponse;
import com.fpt.evcare.dto.response.UserResponse;
import com.nimbusds.jose.JOSEException;

import java.util.Map;
import java.util.UUID;

public interface TokenService {

    String generateAccessToken(UUID userId) throws JOSEException;
    String generateRefreshToken(UUID userId) throws JOSEException;

    TokenResponse validateToken(TokenRequest tokenRequest);
    UUID extractUserIdFromToken(String token);

    LoginResponse refreshToken(TokenRequest request) throws JOSEException;

    void saveAccessToken(UUID userId, String token, long durationSeconds);
    void saveRefreshToken(UUID userId, String token, long durationSeconds);
    String getAccessToken(UUID userId);
    String getRefreshToken(UUID userId);
    boolean validateAccessTokenInRedis(UUID userId, String token);
    boolean validateRefreshTokenInRedis(UUID userId, String token);
    void removeTokens(UUID userId);
    long getRefreshTokenTTL(UUID userId);

    UserResponse validateGoogleToken(String googleAccessToken);
}
