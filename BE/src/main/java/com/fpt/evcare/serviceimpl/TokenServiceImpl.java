package com.fpt.evcare.serviceimpl;

import com.fpt.evcare.constants.TokenConstants;
import com.fpt.evcare.service.RedisService;
import com.fpt.evcare.service.TokenService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TokenServiceImpl implements TokenService {

    RedisService<String> redisService; // sử dụng RedisServiceImpl<String>


    @Override
    public void saveAccessToken(UUID userId, String token, long durationSeconds) {
        redisService.save(TokenConstants.ACCESS_PREFIX + userId, token, durationSeconds, TimeUnit.SECONDS);
    }

    @Override
    public void saveRefreshToken(UUID userId, String token, long durationDays) {
        redisService.save(TokenConstants.REFRESH_PREFIX + userId, token, durationDays, TimeUnit.DAYS);
    }

    @Override
    public String getAccessToken(UUID userId) {
        return redisService.getValue(TokenConstants.ACCESS_PREFIX + userId);
    }

    @Override
    public String getRefreshToken(UUID userId) {
        return redisService.getValue(TokenConstants.REFRESH_PREFIX + userId);
    }

    @Override
    public boolean validateAccessToken(UUID userId, String token) {
        String stored = getAccessToken(userId);
        return stored != null && stored.equals(token);
    }

    @Override
    public boolean validateRefreshToken(UUID userId, String token) {
        String stored = getRefreshToken(userId);
        return stored != null && stored.equals(token);
    }

    @Override
    public void removeTokens(UUID userId) {
        redisService.delete(TokenConstants.ACCESS_PREFIX + userId);
        redisService.delete(TokenConstants.REFRESH_PREFIX + userId);
    }
}
