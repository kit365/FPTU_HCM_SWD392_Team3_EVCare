package com.fpt.evcare.serviceimpl;

import com.fpt.evcare.constants.AuthConstants;
import com.fpt.evcare.constants.TokenConstants;
import com.fpt.evcare.dto.request.TokenRequest;
import com.fpt.evcare.dto.response.LoginResponse;
import com.fpt.evcare.dto.response.TokenResponse;
import com.fpt.evcare.dto.response.UserResponse;
import com.fpt.evcare.entity.UserEntity;
import com.fpt.evcare.exception.InvalidCredentialsException;
import com.fpt.evcare.exception.ResourceNotFoundException;
import com.fpt.evcare.mapper.UserMapper;
import com.fpt.evcare.repository.UserRepository;
import com.fpt.evcare.service.RedisService;
import com.fpt.evcare.service.TokenService;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TokenServiceImpl implements TokenService {

    RedisService<String> redisService;
    CustomJWTDecode customJWTDecode;
    UserRepository userRepository;
    UserMapper userMapper;


    @Override
    public void saveAccessToken(UUID userId, String token, long durationSeconds) {
        redisService.save(TokenConstants.ACCESS_PREFIX + userId, token, durationSeconds, TimeUnit.SECONDS);
    }

    @Override
    public void saveRefreshToken(UUID userId, String token, long durationDays) {
        redisService.save(TokenConstants.REFRESH_PREFIX + userId, token, durationDays, TimeUnit.SECONDS);
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
    public boolean validateAccessTokenInRedis(UUID userId, String token) {
        String stored = getAccessToken(userId);
        return stored != null && stored.equals(token);
    }

    @Override
    public boolean validateRefreshTokenInRedis(UUID userId, String token) {
        String stored = getRefreshToken(userId);
        return stored != null && stored.equals(token);
    }

    @Override
    public void removeTokens(UUID userId) {
        redisService.delete(TokenConstants.ACCESS_PREFIX + userId);
        redisService.delete(TokenConstants.REFRESH_PREFIX + userId);
    }

    @Override
    public long getRefreshTokenTTL(UUID userId) {
        return redisService.getExpire(TokenConstants.REFRESH_PREFIX + userId, TimeUnit.SECONDS);
    }

    @Override
    public String generateAccessToken(UUID userId) throws JOSEException {
        // Lấy thông tin user để add vào JWT claims
        UserEntity user = userRepository.findByUserIdAndIsDeletedFalse(userId);
        if (user == null) {
            throw new IllegalArgumentException("User not found with id: " + userId);
        }
        
        // Lấy role đầu tiên (giả định user chỉ có 1 role chính)
        String role = user.getRole() != null ? user.getRole().getRoleName().name() 
                : "CUSTOMER";
        
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS256);
        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(String.valueOf(userId))
                .claim("username", user.getUsername())
                .claim("role", role)
                .issuer(AuthConstants.APP_NAME)
                .issueTime(new Date())
                .expirationTime(new Date(Instant.now().plus(3600, ChronoUnit.SECONDS).toEpochMilli()))
                .build();
        JWSObject jwsObject = new JWSObject(header, claimsSet.toPayload());
        jwsObject.sign(new MACSigner(String.valueOf(customJWTDecode.getMacSigner())));
        return jwsObject.serialize();
    }

    @Override
    public String generateRefreshToken(UUID userId) throws JOSEException {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS256);
        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(String.valueOf(userId))
                .issuer(AuthConstants.APP_NAME)
                .issueTime(new Date())
                .expirationTime(new Date(Instant.now().plus(604800, ChronoUnit.SECONDS).toEpochMilli()))
                .build();
        JWSObject jwsObject = new JWSObject(header, claimsSet.toPayload());
        jwsObject.sign(new MACSigner(String.valueOf(customJWTDecode.getMacSigner())));
        return jwsObject.serialize();
    }

    private String generateRefreshTokenWithTTL(UUID userId, long remainingTtl) throws JOSEException {
        if (remainingTtl <= 0) {
            throw new InvalidCredentialsException(TokenConstants.MESSAGE_ERR_REFRESH_TOKEN_EXPIRED);
        }
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS256);
        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(String.valueOf(userId))
                .issuer(AuthConstants.APP_NAME)
                .issueTime(new Date())
                .expirationTime(new Date(Instant.now().plus(remainingTtl, ChronoUnit.SECONDS).toEpochMilli()))
                .build();
        JWSObject jwsObject = new JWSObject(header, claimsSet.toPayload());
        jwsObject.sign(new MACSigner(String.valueOf(customJWTDecode.getMacSigner())));
        return jwsObject.serialize();
    }

    @Override
    public TokenResponse validateToken(TokenRequest tokenRequest) {
        try {
            // Parse token
            SignedJWT signedJWT = SignedJWT.parse(tokenRequest.getToken());
            JWSVerifier verifier = new MACVerifier(String.valueOf(customJWTDecode.getMacSigner()));

            boolean signatureValid = signedJWT.verify(verifier);
            boolean notExpired = signedJWT.getJWTClaimsSet()
                    .getExpirationTime()
                    .after(new Date());

            // Lấy userId từ token
            UUID userId = UUID.fromString(signedJWT.getJWTClaimsSet().getSubject());

            // Kiểm tra trong Redis
            String redisToken = redisService.getValue(TokenConstants.ACCESS_PREFIX + userId);
            boolean inRedis = redisToken != null && redisToken.equals(tokenRequest.getToken());

            boolean isValid = signatureValid && notExpired && inRedis;

            return TokenResponse.builder()
                    .token(tokenRequest.getToken())
                    .authorized(isValid)
                    .build();
        } catch (Exception e) {
            if (log.isErrorEnabled()) {
                log.error("Token validation failed: {}", e.getMessage());
            }
            throw new IllegalArgumentException(TokenConstants.MESSAGE_ERR_TOKEN_INVALID);
        }
    }

    @Override
    public UUID extractUserIdFromToken(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            return UUID.fromString(signedJWT.getJWTClaimsSet().getSubject());
        } catch (Exception e) {
            if (log.isErrorEnabled()) {
                log.error("Failed to extract userId from token: {}", e.getMessage());
            }
            throw new IllegalArgumentException(TokenConstants.MESSAGE_ERR_TOKEN_INVALID);
        }
    }

    @Override
    public LoginResponse refreshToken(TokenRequest request) throws JOSEException {
        String oldRefreshToken = request.getToken();
        UUID userId = extractUserIdFromToken(oldRefreshToken);

        // 1. Kiểm tra refresh token trong Redis
        String storedRefreshToken = getRefreshToken(userId);
        if (storedRefreshToken == null || !storedRefreshToken.equals(request.getToken())) {
            throw new InvalidCredentialsException(TokenConstants.MESSAGE_ERR_TOKEN_INVALID);
        }

        // 2. Lấy TTL còn lại của refresh token cũ
        long remainingTtl = getRefreshTokenTTL(userId);
        if (remainingTtl <= 0) {
            throw new InvalidCredentialsException(TokenConstants.MESSAGE_ERR_REFRESH_TOKEN_EXPIRED);
        }

        // 3. Sinh access token mới
        String newAccessToken = generateAccessToken(userId);

        // 4. Sinh refresh token mới với TTL còn lại
        String newRefreshToken = generateRefreshTokenWithTTL(userId, remainingTtl);

        // 5. Xoá tokens cũ và lưu tokens mới
        removeTokens(userId);
        saveAccessToken(userId, newAccessToken, 3600); // 1h
        saveRefreshToken(userId, newRefreshToken, remainingTtl);

        // 6. Trả về response
        return LoginResponse.builder()
                .token(newAccessToken)
                .refreshToken(newRefreshToken)
                .authenticated(true)
                .build();
    }

    // ============================
    // Google Token Validation Methods
    // ============================
    @Override
    public UserResponse validateGoogleToken(String googleAccessToken) {
        try {
            // 1. Gọi Google's tokeninfo API để validate token
            RestTemplate restTemplate = new RestTemplate();
            String googleApiUrl = "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=" + googleAccessToken;
            
            @SuppressWarnings("unchecked")
            Map<String, Object> googleResponse = restTemplate.getForObject(googleApiUrl, Map.class);
            
            // 2. Kiểm tra response từ Google
            if (googleResponse == null || googleResponse.containsKey("error")) {
                throw new InvalidCredentialsException("Google token không hợp lệ hoặc đã hết hạn");
            }
            
            // 3. Lấy email từ Google response
            String email = (String) googleResponse.get("email");
            if (email == null || email.isEmpty()) {
                throw new InvalidCredentialsException("Không thể lấy email từ Google token");
            }
            
            // 4. Tìm user trong database theo email
            UserEntity user = userRepository.findByEmailAndIsDeletedFalse(email);
            if (user == null) {
                throw new ResourceNotFoundException("Không tìm thấy user với email: " + email);
            }
            
            // 5. Map entity sang response
            return userMapper.toResponse(user);
            
        } catch (Exception e) {
            if (log.isErrorEnabled()) {
                log.error("Error validating Google token: {}", e.getMessage());
            }
            if (e instanceof InvalidCredentialsException || e instanceof ResourceNotFoundException) {
                throw e;
            }
            throw new InvalidCredentialsException("Không thể validate Google token: " + e.getMessage());
        }
    }


}
