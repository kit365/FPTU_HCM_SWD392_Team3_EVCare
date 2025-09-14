package com.fpt.evcare.controller;

import com.fpt.evcare.base.ApiResponse;
import com.fpt.evcare.constants.AuthConstants;
import com.fpt.evcare.dto.request.LoginRequest;
import com.fpt.evcare.dto.response.LoginResponse;
import com.fpt.evcare.service.AuthService;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping(AuthConstants.BASE_URL)
public class AuthController{
    AuthService authService;

    @PostMapping(AuthConstants.LOGIN)
    public ResponseEntity<ApiResponse<LoginResponse>> login(@RequestBody LoginRequest loginRequest) {
        LoginResponse loginResponse = authService.login(loginRequest);

        if (loginResponse == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<LoginResponse>builder()
                            .success(false)
                            .message("Đăng nhập thất bại")
                            .errorCode("AUTH_FAILED") //
                            .build()
                    );
        }

        return ResponseEntity
                .ok(ApiResponse.<LoginResponse>builder()
                        .success(true)
                        .message("Đăng nhập thành công")
                        .data(loginResponse)
                        .build()
                );
    }
}
