package com.fpt.evcare.serviceimpl;

import com.fpt.evcare.constants.AuthConstants;
import com.fpt.evcare.constants.TokenConstants;
import com.fpt.evcare.constants.UserConstants;
import com.fpt.evcare.dto.request.LoginRequest;
import com.fpt.evcare.dto.request.LogoutRequest;
import com.fpt.evcare.dto.request.TokenRequest;
import com.fpt.evcare.dto.request.user.RegisterUserRequest;
import com.fpt.evcare.dto.response.LoginResponse;
import com.fpt.evcare.dto.response.TokenResponse;
import com.fpt.evcare.dto.response.RegisterUserResponse;
import com.fpt.evcare.dto.response.UserResponse;
import com.fpt.evcare.entity.RoleEntity;
import com.fpt.evcare.entity.UserEntity;
import com.fpt.evcare.enums.RoleEnum;
import com.fpt.evcare.exception.DisabledException;
import com.fpt.evcare.exception.InvalidCredentialsException;
import com.fpt.evcare.exception.UserValidationException;
import com.fpt.evcare.mapper.UserMapper;
import com.fpt.evcare.repository.RoleRepository;
import com.fpt.evcare.repository.UserRepository;
import com.fpt.evcare.service.AuthService;
import com.fpt.evcare.service.RedisService;
import com.fpt.evcare.service.TokenService;
import com.fpt.evcare.service.UserService;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.core.OAuth2RefreshToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthServiceImpl implements AuthService {

    PasswordEncoder passwordEncoder;
    UserService userService;
    CustomJWTDecode customJWTDecode;
    TokenService tokenService;
    RedisService<String> redisService;
    UserRepository userRepository;
    UserMapper userMapper;
    RoleRepository roleRepository;

    @Override
    public LoginResponse login(LoginRequest loginRequest) throws JOSEException {
        UserEntity user = userService.getUserByEmail(loginRequest.getEmail());
        validateAccount(user);

        boolean authenticated = passwordEncoder.matches(loginRequest.getPassword(),
                user.getPassword());

        if (!authenticated) {
            if (log.isErrorEnabled()) {
                log.error(AuthConstants.MESSAGE_ERR_INVALID_PASSWORD);
            }
            throw new InvalidCredentialsException(AuthConstants.MESSAGE_ERR_INVALID_PASSWORD);
        }

        // Sinh cả Access Token và Refresh Token
        String accessToken = generateAccessToken(user.getUserId());
        String refreshToken = generateRefreshToken(user.getUserId());


        // Lưu vào Redis (tuỳ chọn)
        tokenService.saveAccessToken(user.getUserId(), accessToken, 3600); // 1h
        tokenService.saveRefreshToken(user.getUserId(), refreshToken, 604800);   // 7 ngày

        if (log.isInfoEnabled()) {
            log.info(AuthConstants.MESSAGE_SUCCESS_ACCOUNT_LOGIN, loginRequest.getEmail());
        }

        // Trả response gồm cả 2 token
        LoginResponse response = new LoginResponse();
        response.setToken(accessToken);
        response.setRefreshToken(refreshToken);
        response.setAuthenticated(true);
        return response;
    }


    private void validateAccount(UserEntity user) {
        if (Boolean.TRUE.equals(user.getIsDeleted())) {
            log.error(UserConstants.MESSAGE_ERR_USER_DELETED);
            throw new DisabledException(UserConstants.MESSAGE_ERR_USER_DELETED);
        }
        // sau này thêm: locked, expired... cũng nhét ở đây
    }

    public String generateAccessToken(UUID userId) throws JOSEException {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS256);
        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(String.valueOf(userId))
                .issuer(AuthConstants.APP_NAME)
                .issueTime(new Date())
                .expirationTime(new Date(Instant.now().plus(3600, ChronoUnit.SECONDS).toEpochMilli()))
                .build();
        JWSObject jwsObject = new JWSObject(header, claimsSet.toPayload());
        jwsObject.sign(new MACSigner(String.valueOf(customJWTDecode.getMacSigner())));
        return jwsObject.serialize();
    }


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

    private String generateRefreshTokenOnRefresh(UUID userId) throws JOSEException {

        long remainingTtl = redisService.getExpire(TokenConstants.REFRESH_PREFIX + userId, TimeUnit.SECONDS);
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
    public LoginResponse refreshToken(TokenRequest request) throws JOSEException {

        String oldRefreshToken = request.getToken();
        UUID userId = UUID.fromString(getUserIdByToken(oldRefreshToken));

        // 1. Kiểm tra refresh token trong Redis
        String refreshment = redisService.getValue(TokenConstants.REFRESH_PREFIX + userId);
        if (!refreshment.equals(request.getToken())) {
            throw new InvalidCredentialsException(TokenConstants.MESSAGE_ERR_TOKEN_INVALID);
        }

        // 2. Lấy TTL còn lại của refresh token cũ
        long remainingTtl = redisService.getExpire(TokenConstants.REFRESH_PREFIX + userId, TimeUnit.SECONDS);
        if (remainingTtl <= 0) {
            throw new InvalidCredentialsException(TokenConstants.MESSAGE_ERR_REFRESH_TOKEN_EXPIRED);
        }

        // 3. Sinh access token mới
        String newAccessToken = generateAccessToken(userId);

        // 4. Sinh refresh token mới
        String newRefreshToken = generateRefreshTokenOnRefresh(userId);

        // 5. Xoá refresh token cũ, lưu refresh token mới với TTL còn lại
        redisService.delete(TokenConstants.REFRESH_PREFIX + userId);


        // Lưu vào Redis (tuỳ chọn)
        tokenService.saveAccessToken(userId, newAccessToken, 3600); // 1h
        tokenService.saveRefreshToken(userId, newRefreshToken, remainingTtl);   // 7 ngày

        // 6. Trả về response
        return LoginResponse.builder()
                .token(newAccessToken)
                .refreshToken(newRefreshToken)
                .authenticated(true)
                .build();
    }



    @Override
    public String logout(LogoutRequest request) {
        tokenService.removeTokens(request.getUserId());
        if (log.isInfoEnabled()) {
            log.info("User with ID {} logged out successfully", request.getUserId());
        }
        return null;
    }

    @Override
    public TokenResponse validateToken(TokenRequest token) {
        try {
            // Parse token
            SignedJWT signedJWT = SignedJWT.parse(token.getToken());
            JWSVerifier verifier = new MACVerifier(String.valueOf(customJWTDecode.getMacSigner()));

            boolean signatureValid = signedJWT.verify(verifier);
            boolean notExpired = signedJWT.getJWTClaimsSet()
                    .getExpirationTime()
                    .after(new Date());

            // Lấy userId từ token (ví dụ trong claim "sub")
            UUID userId = UUID.fromString(signedJWT.getJWTClaimsSet().getSubject());


            // Kiểm tra trong Redis
            String redisToken = redisService.getValue(TokenConstants.ACCESS_PREFIX + userId);

            boolean inRedis = redisToken != null && redisToken.equals(token.getToken());

            boolean isValid = signatureValid && notExpired && inRedis;

            return TokenResponse.builder()
                    .token(token.getToken())
                    .authorized(isValid)
                    .build();
        } catch (Exception e) {
            throw new IllegalArgumentException(TokenConstants.MESSAGE_ERR_TOKEN_INVALID);
        }
    }

    public String getUserIdByToken(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            return signedJWT.getJWTClaimsSet().getSubject();
        } catch (Exception e) {
            if (log.isErrorEnabled()) {
                log.error("Failed to extract email from token: {}", e.getMessage());
            }
            throw new IllegalArgumentException("Invalid token");
        }
    }

    @Override
    public UserResponse getUserByToken(TokenRequest token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token.getToken());
            String userId = signedJWT.getJWTClaimsSet().getSubject();
            UserEntity userEntity = userRepository.findByUserIdAndIsDeletedFalse(UUID.fromString(userId));
            return userMapper.toResponse(userEntity);
        } catch (Exception e) {
            if (log.isErrorEnabled()) {
                log.error("Failed to extract email from token: {}", e.getMessage());
            }
            throw new IllegalArgumentException(TokenConstants.MESSAGE_ERR_TOKEN_DISABLED);
        }
    }



    //sẽ chỉnh sua lai sau de thuc hien tot SOLID
    @Override
    public RegisterUserResponse registerUser(@Valid RegisterUserRequest registerUserRequest) throws JOSEException {
        UserEntity user = userRepository.findByEmailAndIsDeletedFalse(registerUserRequest.getEmail());

        if (user != null) {
            if(log.isErrorEnabled()) {
                log.warn(UserConstants.LOG_ERR_DUPLICATED_USER_EMAIL);
            }
            throw new UserValidationException(UserConstants.MESSAGE_ERR_DUPLICATED_USER_EMAIL);
        }

        if(userRepository.existsByUsername(registerUserRequest.getUsername())) {
            if(log.isErrorEnabled()) {
                log.warn(UserConstants.LOG_ERR_DUPLICATED_USERNAME);
            }
            throw new UserValidationException(UserConstants.MESSAGE_ERR_DUPLICATED_USERNAME);
        }

        if(userRepository.existsByNumberPhone(registerUserRequest.getNumberPhone())) {
            if(log.isErrorEnabled()) {
                log.warn(UserConstants.LOG_ERR_DUPLICATED_USER_PHONE);
            }
            throw new UserValidationException(UserConstants.MESSAGE_ERR_DUPLICATED_USER_PHONE);
        }

        UserEntity userEntity = userMapper.toEntity(registerUserRequest);
        userEntity.setPassword(passwordEncoder.encode(registerUserRequest.getPassword()));
        userEntity.setRoles(List.of(roleRepository.findByRoleName(RoleEnum.CUSTOMER)));
        userRepository.save(userEntity);
        String accessToken = generateAccessToken(userEntity.getUserId());
        String refreshToken = generateRefreshToken(userEntity.getUserId());
        tokenService.saveAccessToken(userEntity.getUserId(), accessToken, 3600); // 1h
        tokenService.saveRefreshToken(userEntity.getUserId(), refreshToken, 604800);   // 7 ngày
        log.info(AuthConstants.LOG_SUCCESS_ACCOUNT_REGISTER, registerUserRequest.getEmail());
        RegisterUserResponse registerUserResponse = userMapper.toRegisterUserResponse(userEntity);
        registerUserResponse.setToken(accessToken);
        registerUserResponse.setRefreshToken(refreshToken);
        return registerUserResponse;
    }

    @Override
    public Map<String, Object> getUserInfo(OAuth2User principal, OAuth2AuthorizedClient authorizedClient) {
        String accessToken = authorizedClient.getAccessToken().getTokenValue();
        OAuth2RefreshToken oAuth2RefreshToken = authorizedClient.getRefreshToken();
        String refreshToken = (oAuth2RefreshToken != null) ? oAuth2RefreshToken.getTokenValue() : null;

        String email = principal.getAttribute("email");
        String name = principal.getAttribute("name");

        UserEntity userEntity = userRepository.findByEmailAndIsDeletedFalse(email);
        List<RoleEntity> role = new ArrayList<>();
        role.add(roleRepository.findByRoleName(RoleEnum.CUSTOMER));

        if (userEntity == null) {
            String search = concatenateSearchField(name, "", email, email);
            UserEntity user = new UserEntity();
            user.setRoles(role);
            user.setPassword(UUID.randomUUID().toString());
            user.setSearch(search);
            user.setUsername(email); // Sử dụng email làm username
            user.setEmail(email);
            user.setFullName(name);
            user.setProvider("GOOGLE");
            userEntity = userRepository.save(user);
            log.info("Saved user from Google login: " + user);
        }
        tokenService.saveAccessToken(userEntity.getUserId(), accessToken, 3600);
        tokenService.saveRefreshToken(userEntity.getUserId(), refreshToken, 604800);

        Map<String, Object> response = new HashMap<>();
        response.put("user", principal.getAttributes());
        response.put("accessToken", accessToken);
        response.put("refreshToken", refreshToken);

        return response;
    }
    private String concatenateSearchField(String fullName, String numberPhone, String email, String username) {
        return String.join("-",
                fullName != null ? fullName : "",
                numberPhone != null ? numberPhone : "",
                email != null ? email : "",
                username != null ? username : ""
        );
    }

}
