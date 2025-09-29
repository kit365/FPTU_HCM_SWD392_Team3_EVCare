package com.fpt.evcare.service;

import java.util.UUID;

public interface TokenService {
    void saveAccessToken(UUID userId, String token, long durationSeconds);
    void saveRefreshToken(UUID userId, String token, long durationDays);

    String getAccessToken(UUID userId);
    String getRefreshToken(UUID userId);

    boolean validateAccessToken(UUID userId, String token);
    boolean validateRefreshToken(UUID userId, String token);

    void removeTokens(UUID userId);
}
