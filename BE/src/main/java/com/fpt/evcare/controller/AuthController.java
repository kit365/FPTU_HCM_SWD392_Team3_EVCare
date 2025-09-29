package com.fpt.evcare.controller;

import com.fpt.evcare.base.ApiResponse;
import com.fpt.evcare.constants.AuthConstants;
import com.fpt.evcare.dto.request.LoginRequest;
import com.fpt.evcare.dto.request.TokenRequest;
import com.fpt.evcare.dto.request.user.CreationUserRequest;
import com.fpt.evcare.dto.request.user.RegisterUserRequest;
import com.fpt.evcare.dto.response.LoginResponse;
import com.fpt.evcare.dto.response.RegisterUserResponse;
import com.fpt.evcare.dto.response.TokenResponse;
import com.fpt.evcare.service.AuthService;
import com.fpt.evcare.service.UserService;
import com.nimbusds.jose.JOSEException;
import io.swagger.v3.oas.annotations.Operation;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping(AuthConstants.BASE_URL)
public class AuthController {
    AuthService authService;
    UserService userService;


    @PostMapping(AuthConstants.LOGIN)
    @Operation(summary = "Đăng nhập tài khoản", description = "Người dùng đăng nhập bằng email và mật khẩu, trả về JWT token")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@RequestBody LoginRequest loginRequest) throws JOSEException {
        if(log.isErrorEnabled()) {
            log.info(AuthConstants.LOG_SUCCESS_ACCOUNT_LOGIN, loginRequest.getEmail());
        }

        LoginResponse loginResponse = authService.login(loginRequest);
        return ResponseEntity
                .ok(ApiResponse.<LoginResponse>builder()
                        .success(true)
                        .message(AuthConstants.MESSAGE_SUCCESS_ACCOUNT_LOGIN)
                        .data(loginResponse)
                        .build()
                );
    }
    @PostMapping(AuthConstants.REGISTER)
    @Operation(summary = "Đăng ký tài khoản", description = "Người dùng đăng ký tài khoản mới")
    public ResponseEntity<ApiResponse<RegisterUserResponse>> register(@RequestBody RegisterUserRequest registerUserRequest) throws JOSEException {
        RegisterUserResponse response = authService.registerUser(registerUserRequest);
        return ResponseEntity
                .ok(ApiResponse.<RegisterUserResponse>builder()
                        .success(true)
                        .message(AuthConstants.MESSAGE_SUCCESS_ACCOUNT_REGISTER)
                        .data(response)
                        .build()
                );

    }
    @PostMapping(AuthConstants.REFRESH)
    public ResponseEntity<ApiResponse<LoginResponse>> refreshToken(@RequestBody TokenRequest request) throws JOSEException {
        LoginResponse loginResponse = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.<LoginResponse>builder()
                .success(true)
                .message(AuthConstants.MESSAGE_SUCCESS_ACCOUNT_LOGIN)
                .data(loginResponse)
                .build());
    }

    @PostMapping(AuthConstants.VALID)
    public ResponseEntity<ApiResponse<TokenResponse>> validateToken(@RequestBody TokenRequest request) throws JOSEException {
        TokenResponse tokenResponse = authService.validateToken(request);
        return ResponseEntity.ok(ApiResponse.<TokenResponse>builder()
                .success(true)
                .message(AuthConstants.MESSAGE_SUCCESS_VALIDATE_TOKEN)
                .data(tokenResponse)
                .build());
    }




    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestBody CreationUserRequest request) {
        authService.logout(request);
        return ResponseEntity.ok("Logout successful");
    }
}
