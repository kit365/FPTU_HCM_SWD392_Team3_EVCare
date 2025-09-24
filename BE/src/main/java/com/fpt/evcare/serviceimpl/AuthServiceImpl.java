package com.fpt.evcare.serviceimpl;

import com.fpt.evcare.constants.AuthConstants;
import com.fpt.evcare.constants.UserConstants;
import com.fpt.evcare.dto.request.LoginRequest;
import com.fpt.evcare.dto.response.LoginResponse;
import com.fpt.evcare.entity.UserEntity;
import com.fpt.evcare.exception.DisabledException;
import com.fpt.evcare.exception.InvalidCredentialsException;
import com.fpt.evcare.service.AuthService;
import com.fpt.evcare.service.UserService;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

@Slf4j
@Service
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthServiceImpl implements AuthService {

    PasswordEncoder passwordEncoder;
    UserService userService;
    CustomJWTDecode customJWTDecode;
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

        var token = generateToken(loginRequest.getEmail());
        if(log.isErrorEnabled()) {
            log.info(AuthConstants.MESSAGE_SUCCESS_ACCOUNT_LOGIN, loginRequest.getEmail());
        }

        LoginResponse response = new LoginResponse();
        response.setToken(token);
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

    private String generateToken(String email) throws JOSEException {
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
}
