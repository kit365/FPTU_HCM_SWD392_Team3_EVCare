package com.fpt.evcare.serviceimpl;

import com.fpt.evcare.constants.AuthConstants;
import com.fpt.evcare.constants.TokenConstants;
import com.fpt.evcare.constants.UserConstants;
import com.fpt.evcare.dto.request.LoginRequest;
import com.fpt.evcare.dto.request.TokenRequest;
import com.fpt.evcare.dto.request.user.CreationUserRequest;
import com.fpt.evcare.dto.request.user.RegisterUserRequest;
import com.fpt.evcare.dto.response.LoginResponse;
import com.fpt.evcare.dto.response.TokenResponse;
import com.fpt.evcare.dto.response.RegisterUserResponse;
import com.fpt.evcare.entity.UserEntity;
import com.fpt.evcare.enums.RoleEnum;
import com.fpt.evcare.exception.DisabledException;
import com.fpt.evcare.exception.IllegalArgumentException;
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
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.concurrent.TimeUnit;
import java.util.List;

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
        String accessToken = generateAccessToken(loginRequest.getEmail());
        String refreshToken = generateRefreshToken(loginRequest.getEmail());


        // Lưu vào Redis (tuỳ chọn)
        tokenService.saveAccessToken(user.getUserId(), accessToken, 3600); // 1h
        tokenService.saveRefreshToken(user.getUserId(), refreshToken, 7);   // 7 ngày

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

    private String generateAccessToken(String email) throws JOSEException {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS256);
        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(email)
                .issuer(AuthConstants.APP_NAME)
                .issueTime(new Date())
                .expirationTime(new Date(Instant.now().plus(1, ChronoUnit.HOURS).toEpochMilli()))
                .build();
        JWSObject jwsObject = new JWSObject(header, claimsSet.toPayload());
        jwsObject.sign(new MACSigner(String.valueOf(customJWTDecode.getMacSigner())));
        return jwsObject.serialize();
    }


    private String generateRefreshToken(String email) throws JOSEException {

        JWSHeader header = new JWSHeader(JWSAlgorithm.HS256);
        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(email)
                .issuer(AuthConstants.APP_NAME)
                .issueTime(new Date())
                .expirationTime(new Date(Instant.now().plus(7, ChronoUnit.DAYS).toEpochMilli()))
                .build();
        JWSObject jwsObject = new JWSObject(header, claimsSet.toPayload());
        jwsObject.sign(new MACSigner(String.valueOf(customJWTDecode.getMacSigner())));
        return jwsObject.serialize();
    }
    @Override
    public LoginResponse refreshToken(TokenRequest request) throws JOSEException {
        String refreshToken = request.getToken();
        // 1. Kiểm tra refresh token trong Redis
        String email = redisService.getValue(TokenConstants.REFRESH_PREFIX + refreshToken);
        if (email == null) {
            throw new InvalidCredentialsException("Refresh token không hợp lệ hoặc đã hết hạn");
        }

        // 2. Sinh access token mới
        String newAccessToken = generateAccessToken(email);

        // 3. (Tuỳ chọn) Sinh refresh token mới
        String newRefreshToken = generateRefreshToken(email);

        // 4. Lưu refresh token mới vào Redis, xoá cái cũ
        redisService.delete("refresh:" + refreshToken);
        redisService.save("refresh:" + newRefreshToken, email, 7, TimeUnit.DAYS);

        // 5. Trả về response
        return LoginResponse.builder()
                .token(newAccessToken)
                .refreshToken(newRefreshToken)
                .authenticated(true)
                .build();
    }


    @Override
    public void logout(CreationUserRequest request) {
        tokenService.removeTokens(request.getUserId());
        if (log.isInfoEnabled()) {
            log.info("User with ID {} logged out successfully", request.getUserId());
        }
    }
    @Override
    public TokenResponse validateToken(TokenRequest token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token.getToken());
            JWSVerifier verifier = new MACVerifier(String.valueOf(customJWTDecode.getMacSigner()));
            boolean isValid = signedJWT.verify(verifier)
                    && signedJWT.getJWTClaimsSet().getExpirationTime().after(new Date());
            return TokenResponse.builder()
                    .token(token.getToken())
                    .authorized(isValid)
                    .build();
        } catch (Exception e) {
            throw new IllegalArgumentException(AuthConstants.MESSAGE_ERR_TOKEN_DISABLED);
        }
    }


    //sẽ chỉnh sua lai sau de thuc hien tot SOLID
    @Override
    public RegisterUserResponse registerUser(@Valid RegisterUserRequest registerUserRequest) throws JOSEException {
        UserEntity user = userRepository.findByEmail(registerUserRequest.getEmail());

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
        log.info(AuthConstants.LOG_SUCCESS_ACCOUNT_REGISTER, registerUserRequest.getEmail());
        RegisterUserResponse registerUserResponse = userMapper.toRegisterUserResponse(userEntity);
        registerUserResponse.setToken(generateAccessToken(userEntity.getEmail()));
        registerUserResponse.setRefreshToken(generateRefreshToken(userEntity.getEmail()));
        return registerUserResponse;
    }
}
