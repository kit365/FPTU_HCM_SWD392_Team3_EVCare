package com.fpt.evcare.controller;

import com.fpt.evcare.base.ApiResponse;
import com.fpt.evcare.constants.AuthConstants;
import com.fpt.evcare.dto.request.TokenRequest;
import com.fpt.evcare.dto.response.LoginResponse;
import com.fpt.evcare.dto.response.TokenResponse;
import com.fpt.evcare.dto.response.UserResponse;
import com.fpt.evcare.service.AuthService;
import com.fpt.evcare.service.TokenService;
import com.nimbusds.jose.JOSEException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


@Slf4j
@RestController
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping(AuthConstants.BASE_URL)
@Tag(name = "Token Management", description = "APIs quản lý JWT tokens (refresh, validate, parse)")
public class TokenController {
    
    TokenService tokenService;
    AuthService authService;
    @PostMapping(AuthConstants.REFRESH)
    @Operation(
            summary = "Làm mới access token", 
            description = "🔓 **Public** - Sử dụng refresh token để tạo access token mới. Refresh token cũ sẽ được thay thế bằng refresh token mới với TTL giữ nguyên."
    )
    public ResponseEntity<ApiResponse<LoginResponse>> refreshToken(@RequestBody TokenRequest request) throws JOSEException {
        LoginResponse loginResponse = tokenService.refreshToken(request);
        
        if(log.isInfoEnabled()) {
            log.info("Token refreshed successfully");
        }
        
        return ResponseEntity.ok(
                ApiResponse.<LoginResponse>builder()
                        .success(true)
                        .message("Làm mới token thành công")
                        .data(loginResponse)
                        .build()
        );
    }
    @PostMapping(AuthConstants.VALID)
    @Operation(
            summary = "Kiểm tra tính hợp lệ của token", 
            description = "🔓 **Public** - Validate JWT token: kiểm tra signature, expiration và xác thực với Redis"
    )
    public ResponseEntity<ApiResponse<TokenResponse>> validateToken(@RequestBody TokenRequest request) {
        TokenResponse tokenResponse = tokenService.validateToken(request);
        return ResponseEntity.ok(
                ApiResponse.<TokenResponse>builder()
                        .success(true)
                        .message(AuthConstants.MESSAGE_SUCCESS_VALIDATE_TOKEN)
                        .data(tokenResponse)
                        .build()
        );
    }

    @PostMapping(AuthConstants.USER_TOKEN)
    @Operation(
            summary = "Lấy thông tin user từ token", 
            description = "🔐 **Roles:** Authenticated (All roles) - Parse JWT token và trả về thông tin user tương ứng"
    )
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserResponse>> getUserByToken(@RequestBody TokenRequest request) {
        UserResponse userResponse = authService.getUserByToken(request);
        return ResponseEntity.ok(
                ApiResponse.<UserResponse>builder()
                        .success(true)
                        .message("Lấy thông tin người dùng thành công")
                        .data(userResponse)
                        .build()
        );
    }

    @PostMapping("/validate-google-token")
    @Operation(
            summary = "Validate Google OAuth2 token", 
            description = "🔓 **Public** - Kiểm tra Google access token có hợp lệ không bằng cách gọi Google's tokeninfo API và trả về thông tin user"
    )
    public ResponseEntity<ApiResponse<UserResponse>> validateGoogleToken(@RequestBody TokenRequest request) {
        UserResponse userResponse = tokenService.validateGoogleToken(request.getToken());
        return ResponseEntity.ok(
                ApiResponse.<UserResponse>builder()
                        .success(true)
                        .message("Google token hợp lệ")
                        .data(userResponse)
                        .build()
        );
    }


}

