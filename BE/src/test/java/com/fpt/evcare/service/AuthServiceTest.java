package com.fpt.evcare.service;

import com.fpt.evcare.constants.TokenConstants;
import com.fpt.evcare.dto.request.LoginRequest;
import com.fpt.evcare.dto.request.LogoutRequest;
import com.fpt.evcare.dto.request.TokenRequest;
import com.fpt.evcare.dto.response.LoginResponse;
import com.fpt.evcare.dto.response.TokenResponse;
import com.fpt.evcare.entity.UserEntity;
import com.fpt.evcare.exception.InvalidCredentialsException;
import com.fpt.evcare.serviceimpl.AuthServiceImpl;
import com.fpt.evcare.serviceimpl.CustomJWTDecode;
import com.nimbusds.jose.crypto.MACSigner;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.fpt.evcare.exception.IllegalArgumentException;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock PasswordEncoder passwordEncoder;
    @Mock UserService userService;
    @Mock CustomJWTDecode customJWTDecode;
    @Mock TokenService tokenService;
    @Mock RedisService redisService;

    @Spy
    @InjectMocks
    AuthServiceImpl authService;

    private UserEntity user;

    @BeforeEach
    void setUp() {
        user = new UserEntity();
        user.setUserId(UUID.randomUUID());
        user.setEmail("test@example.com");
        user.setPassword("encodedPass");
        user.setIsDeleted(false);
    }

    @Test
    void testLogin_Success() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("rawPass");

        MACSigner signer = new MACSigner("12345678901234567890123456789012".getBytes(StandardCharsets.UTF_8));

        when(userService.getUserByEmail("test@example.com")).thenReturn(user);
        when(passwordEncoder.matches("rawPass", "encodedPass")).thenReturn(true);
        when(customJWTDecode.getMacSigner()).thenReturn(signer);

        LoginResponse response = authService.login(request);

        assertNotNull(response);
        assertTrue(response.isAuthenticated());
        assertNotNull(response.getToken());
        assertNotNull(response.getRefreshToken());

        verify(tokenService, times(1))
                .saveAccessToken(eq(user.getUserId()), anyString(), eq(3600L));
        verify(tokenService, times(1))
                .saveRefreshToken(eq(user.getUserId()), anyString(), eq(604800L));
    }

    @Test
    void testLogin_InvalidPassword_ShouldThrowException() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("wrongPass");

        when(userService.getUserByEmail("test@example.com")).thenReturn(user);
        when(passwordEncoder.matches("wrongPass", "encodedPass")).thenReturn(false);

        assertThrows(InvalidCredentialsException.class, () -> authService.login(request));
    }

    @Test
    void testLogout_ShouldCallRemoveTokens() {
        UUID userId = UUID.randomUUID();
        authService.logout(new LogoutRequest(userId));
        verify(tokenService, times(1)).removeTokens(userId);
    }
    @Test
    void testValidateToken_ValidToken_ShouldPass() throws Exception {
        UUID userId = UUID.randomUUID();

        // Key test đủ 32 bytes
        String mockKey = "12345678901234567890123456789012"; // 32 ký tự
        MACSigner macSigner = new MACSigner(mockKey.getBytes(StandardCharsets.UTF_8));

        // Mock customJWTDecode trước khi generate token
        when(customJWTDecode.getMacSigner()).thenReturn(macSigner);

        // Generate token với key mock
        String tokenValue = authService.generateAccessToken(userId);

        TokenRequest tokenRequest = new TokenRequest();
        tokenRequest.setToken(tokenValue);

        // Mock Redis
        when(redisService.getValue(TokenConstants.ACCESS_PREFIX + userId)).thenReturn(tokenValue);

        // Validate token
        TokenResponse response = authService.validateToken(tokenRequest);

        assertNotNull(response);
        assertTrue(response.getAuthorized());
        assertEquals(tokenValue, response.getToken());
    }





    @Test
    void testValidateToken_InvalidToken_ShouldFail() {
        TokenRequest tokenRequest = new TokenRequest();
        tokenRequest.setToken("invalid.token.value");

        assertThrows(IllegalArgumentException.class,  // <— dùng custom exception
                () -> authService.validateToken(tokenRequest));

    }
}
