package com.fpt.evcare.service;

import com.fpt.evcare.constants.TokenConstants;
import com.fpt.evcare.dto.request.LoginRequest;
import com.fpt.evcare.dto.request.LogoutRequest;
import com.fpt.evcare.dto.request.TokenRequest;
import com.fpt.evcare.dto.response.LoginResponse;
import com.fpt.evcare.dto.response.TokenResponse;
import com.fpt.evcare.entity.RoleEntity;
import com.fpt.evcare.entity.UserEntity;
import com.fpt.evcare.enums.RoleEnum;
import com.fpt.evcare.exception.InvalidCredentialsException;
import com.fpt.evcare.repository.RoleRepository;
import com.fpt.evcare.repository.UserRepository;
import com.fpt.evcare.serviceimpl.AuthServiceImpl;
import com.fpt.evcare.serviceimpl.CustomJWTDecode;
import com.nimbusds.jose.crypto.MACSigner;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.fpt.evcare.exception.IllegalArgumentException;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2RefreshToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import static org.assertj.core.api.Assertions.assertThat;


import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock PasswordEncoder passwordEncoder;
    @Mock UserService userService;
    @Mock UserRepository userRepository;
    @Mock CustomJWTDecode customJWTDecode;
    @Mock TokenService tokenService;
    @Mock
    RoleRepository roleRepository;
    @Mock RedisService redisService;
    @Mock OAuth2AuthorizedClient authorizedClient;
    @Mock OAuth2User principal;

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

    @Test
    void getUserInfo_ShouldReturnUserTokens_WhenUserExists() {
        // GIVEN
        String email = "test@gmail.com";
        String name = "Test User";
        String accessTokenValue = "access-token-123";
        String refreshTokenValue = "refresh-token-456";

        UUID userId = UUID.randomUUID();

        UserEntity existingUser = new UserEntity();
        existingUser.setUserId(userId);
        existingUser.setEmail(email);

        when(principal.getAttribute("email")).thenReturn(email);
        when(principal.getAttribute("name")).thenReturn(name);

        when(userRepository.findByEmailAndIsDeletedFalse(email)).thenReturn(existingUser);

        OAuth2AccessToken accessToken = new OAuth2AccessToken(
                OAuth2AccessToken.TokenType.BEARER,
                accessTokenValue,
                Instant.now(),
                Instant.now().plusSeconds(3600)
        );
        OAuth2RefreshToken refreshToken = new OAuth2RefreshToken(
                refreshTokenValue,
                Instant.now()
        );
        when(authorizedClient.getAccessToken()).thenReturn(accessToken);
        when(authorizedClient.getRefreshToken()).thenReturn(refreshToken);

        // WHEN
        Map<String, Object> result = authService.getUserInfo(principal, authorizedClient);

        // THEN
        verify(tokenService).saveAccessToken(userId, accessTokenValue, 3600);
        verify(tokenService).saveRefreshToken(userId, refreshTokenValue, 604800);
        assertThat(result).containsKeys("user", "accessToken", "refreshToken");
        assertThat(result.get("accessToken")).isEqualTo(accessTokenValue);
        assertThat(result.get("refreshToken")).isEqualTo(refreshTokenValue);
    }

    @Test
    void getUserInfo_ShouldCreateUser_WhenUserNotExists() {
        // GIVEN
        String email = "newuser@gmail.com";
        String name = "New User";
        String accessTokenValue = "access-token-xyz";
        String refreshTokenValue = "refresh-token-xyz";

        when(principal.getAttribute("email")).thenReturn(email);
        when(principal.getAttribute("name")).thenReturn(name);

        when(userRepository.findByEmailAndIsDeletedFalse(email)).thenReturn(null);

        RoleEntity customerRole = new RoleEntity();
        customerRole.setRoleName(RoleEnum.CUSTOMER);
        when(roleRepository.findByRoleName(RoleEnum.CUSTOMER)).thenReturn(customerRole);

        OAuth2AccessToken accessToken = new OAuth2AccessToken(
                OAuth2AccessToken.TokenType.BEARER,
                accessTokenValue,
                Instant.now(),
                Instant.now().plusSeconds(3600)
        );
        OAuth2RefreshToken refreshToken = new OAuth2RefreshToken(
                refreshTokenValue,
                Instant.now()
        );
        when(authorizedClient.getAccessToken()).thenReturn(accessToken);
        when(authorizedClient.getRefreshToken()).thenReturn(refreshToken);

        UserEntity savedUser = new UserEntity();
        savedUser.setUserId(UUID.randomUUID());
        savedUser.setEmail(email);
        when(userRepository.save(any(UserEntity.class))).thenReturn(savedUser);

        // WHEN
        Map<String, Object> result = authService.getUserInfo(principal, authorizedClient);

        // THEN
        verify(userRepository).save(any(UserEntity.class));
        verify(tokenService).saveAccessToken(savedUser.getUserId(), accessTokenValue, 3600);
        verify(tokenService).saveRefreshToken(savedUser.getUserId(), refreshTokenValue, 604800);

        assertThat(result).containsKeys("user", "accessToken", "refreshToken");
    }
}
