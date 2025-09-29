package com.fpt.evcare.service;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

public interface TokenService {
    void saveAccessToken(UUID userId, String token, long durationSeconds);
    void saveRefreshToken(UUID userId, String token, long durationSeconds);


    String getAccessToken(UUID userId);
    String getRefreshToken(UUID userId);

    boolean validateAccessToken(UUID userId, String token);
    boolean validateRefreshToken(UUID userId, String token);

    void removeTokens(UUID userId);
}
