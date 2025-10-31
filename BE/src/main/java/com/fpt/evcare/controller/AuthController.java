package com.fpt.evcare.controller;

import com.fpt.evcare.base.ApiResponse;
import com.fpt.evcare.constants.AuthConstants;
import com.fpt.evcare.dto.request.LoginRequest;
import com.fpt.evcare.dto.request.LogoutRequest;
import com.fpt.evcare.dto.request.user.RegisterUserRequest;
import com.fpt.evcare.dto.response.LoginResponse;
import com.fpt.evcare.dto.response.RegisterUserResponse;
import com.fpt.evcare.service.AuthService;
import com.nimbusds.jose.JOSEException;
import io.swagger.v3.oas.annotations.Operation;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.annotation.RegisteredOAuth2AuthorizedClient;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@Slf4j
@RestController
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping(AuthConstants.BASE_URL)
public class AuthController {
    
    AuthService authService;

    @PostMapping(AuthConstants.LOGIN)
    @Operation(summary = "Đăng nhập tài khoản", description = "🔓 **Public** - Người dùng đăng nhập bằng email và mật khẩu, trả về access token và refresh token")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@RequestBody LoginRequest loginRequest) throws JOSEException {
        LoginResponse loginResponse = authService.login(loginRequest);
        
        if(log.isInfoEnabled()) {
            log.info(AuthConstants.LOG_SUCCESS_ACCOUNT_LOGIN, loginRequest.getEmail());
        }
        
        return ResponseEntity.ok(
                ApiResponse.<LoginResponse>builder()
                        .success(true)
                        .message(AuthConstants.MESSAGE_SUCCESS_ACCOUNT_LOGIN)
                        .data(loginResponse)
                        .build()
        );
    }

    @PostMapping(AuthConstants.REGISTER)
    @Operation(summary = "Đăng ký tài khoản", description = "🔓 **Public** - Người dùng đăng ký tài khoản mới, tự động đăng nhập và trả về tokens")
    public ResponseEntity<ApiResponse<RegisterUserResponse>> register(@RequestBody RegisterUserRequest registerUserRequest) throws JOSEException {
        RegisterUserResponse response = authService.registerUser(registerUserRequest);
        return ResponseEntity.ok(
                ApiResponse.<RegisterUserResponse>builder()
                        .success(true)
                        .message(AuthConstants.MESSAGE_SUCCESS_ACCOUNT_REGISTER)
                        .data(response)
                        .build()
        );
    }

    @PostMapping(AuthConstants.LOGOUT)
    @Operation(
            summary = "Đăng xuất tài khoản", 
            description = "🔐 **Roles:** Authenticated (All roles) - Xóa access token và refresh token khỏi Redis, vô hiệu hóa session hiện tại"
    )
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> logout(@RequestBody LogoutRequest request) {
        String result = authService.logout(request);
        
        if(log.isInfoEnabled()) {
            log.info("User {} logged out successfully", request.getUserId());
        }
        
        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .success(true)
                        .message(AuthConstants.MESSAGE_SUCCESS_ACCOUNT_LOGOUT)
                        .data(result)
                        .build()
        );
    }

    @GetMapping()
    @Operation(
            summary = "Lấy thông tin Principal hiện tại", 
            description = "🔐 **Roles:** Authenticated (All roles) - Endpoint để kiểm tra authentication context của Spring Security"
    )
    @PreAuthorize("isAuthenticated()")
    public Principal getCurrentUser(Principal principal) {
        return principal;
    }


    @GetMapping("/user")
    @Operation(
            summary = "Đăng nhập với Google OAuth2", 
            description = "🔐 **Roles:** Authenticated (OAuth2) - Lấy thông tin user từ Google OAuth2 và tạo tài khoản nếu chưa tồn tại"
    )
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserInfoFromGoogle(
            @AuthenticationPrincipal OAuth2User principal,
            @RegisteredOAuth2AuthorizedClient("google") OAuth2AuthorizedClient authorizedClient) {
        
        Map<String, Object> userInfo = authService.getUserInfo(principal, authorizedClient);
        
        return ResponseEntity.ok(
                ApiResponse.<Map<String, Object>>builder()
                        .success(true)
                        .message(AuthConstants.MESSAGE_SUCCESS_GOOGLE_LOGIN)
                        .data(userInfo)
                        .build()
        );
    }


}
