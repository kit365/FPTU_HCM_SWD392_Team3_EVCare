package com.fpt.evcare.controller;

import com.fpt.evcare.base.ApiResponse;
import com.fpt.evcare.constants.AuthConstants;
import com.fpt.evcare.dto.request.LoginRequest;
import com.fpt.evcare.dto.response.LoginResponse;
import com.fpt.evcare.service.AuthService;
import com.nimbusds.jose.JOSEException;
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

    @PostMapping(AuthConstants.LOGIN)
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
}
