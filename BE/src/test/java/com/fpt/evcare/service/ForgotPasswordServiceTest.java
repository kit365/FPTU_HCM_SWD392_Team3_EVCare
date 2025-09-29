package com.fpt.evcare.service;

import com.fpt.evcare.constants.ForgotPasswordConstants;
import com.fpt.evcare.dto.request.EmailRequestDTO;
import com.fpt.evcare.dto.request.ResetPasswordRequest;
import com.fpt.evcare.dto.response.VerifyOtpResponse;
import com.fpt.evcare.entity.UserEntity;
import com.fpt.evcare.exception.OtpExpiredException;
import com.fpt.evcare.exception.ResourceNotFoundException;
import com.fpt.evcare.repository.UserRepository;
import com.fpt.evcare.serviceimpl.ForgotPasswordServiceImpl;
import jakarta.mail.MessagingException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ForgotPasswordServiceTest {

    @Mock
    private UserService userService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RedisService<String> redisService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailService emailService; // Chỉ sử dụng interface EmailService

    @InjectMocks
    private ForgotPasswordServiceImpl forgotPasswordService;

    private final String email = "test@example.com";
    private final String otp = "123456";
    private final String encodedPassword = "encodedPassword";

    @BeforeEach
    void setUp() {
        reset(userService, userRepository, redisService, passwordEncoder, emailService);
    }

    @Test
    void testGenerateOtp() {
        String generatedOtp = forgotPasswordService.generateOtp();
        assertNotNull(generatedOtp);
        assertEquals(ForgotPasswordConstants.DEFAULT_OTP_LENGTH, generatedOtp.length());
        assertTrue(generatedOtp.matches("\\d+"));
    }

    @Test
    void testGetKeyOtpRedis() {
        String key = forgotPasswordService.getKeyOtpRedis(email);
        assertEquals(ForgotPasswordConstants.OTP_REDIS_KEY_PREFIX + email, key);
    }

    @Test
    void testGetRequestedOtpStatusKey() {
        String key = forgotPasswordService.getRequestedOtpStatusKey(email);
        assertEquals(ForgotPasswordConstants.OTP_STATUS_REQUEST_PREFIX + email, key);
    }

    @Test
    void testHasActiveOtp_WhenOtpExists() {
        when(redisService.getValue(ForgotPasswordConstants.OTP_REDIS_KEY_PREFIX + email)).thenReturn(otp);
        boolean result = forgotPasswordService.hasActiveOtp(email);
        assertTrue(result);
        verify(redisService).getValue(ForgotPasswordConstants.OTP_REDIS_KEY_PREFIX + email);
    }

    @Test
    void testHasActiveOtp_WhenOtpDoesNotExist() {
        when(redisService.getValue(ForgotPasswordConstants.OTP_REDIS_KEY_PREFIX + email)).thenReturn(null);
        boolean result = forgotPasswordService.hasActiveOtp(email);
        assertFalse(result);
        verify(redisService).getValue(ForgotPasswordConstants.OTP_REDIS_KEY_PREFIX + email);
    }

    @Test
    void testValidateOtp_ValidOtp() {
        when(redisService.getValue(ForgotPasswordConstants.OTP_REDIS_KEY_PREFIX + email)).thenReturn(otp);
        when(redisService.getValue(ForgotPasswordConstants.OTP_ATTEMPTS_REDIS_KEY_PREFIX + email)).thenReturn("0");

        boolean result = forgotPasswordService.validateOtp(email, otp);
        assertTrue(result);
        verify(redisService).getValue(ForgotPasswordConstants.OTP_REDIS_KEY_PREFIX + email);
        verify(redisService).getValue(ForgotPasswordConstants.OTP_ATTEMPTS_REDIS_KEY_PREFIX + email);
        verify(redisService, never()).save(anyString(), anyString(), anyInt(), any(TimeUnit.class));
    }

    @Test
    void testValidateOtp_InvalidOtp() {
        when(redisService.getValue(ForgotPasswordConstants.OTP_REDIS_KEY_PREFIX + email)).thenReturn(otp);
        when(redisService.getValue(ForgotPasswordConstants.OTP_ATTEMPTS_REDIS_KEY_PREFIX + email)).thenReturn("0");

        boolean result = forgotPasswordService.validateOtp(email, "wrongOtp");
        assertFalse(result);
        verify(redisService).save(
                eq(ForgotPasswordConstants.OTP_ATTEMPTS_REDIS_KEY_PREFIX + email),
                eq("1"),
                eq(ForgotPasswordConstants.OTP_TTL_MINUTES),
                eq(TimeUnit.MINUTES)
        );
    }

    @Test
    void testValidateOtp_MaxAttemptsExceeded() {
        when(redisService.getValue(ForgotPasswordConstants.OTP_ATTEMPTS_REDIS_KEY_PREFIX + email))
                .thenReturn(String.valueOf(ForgotPasswordConstants.OTP_MAX_ATTEMPTS));

        assertThrows(IllegalStateException.class, () -> forgotPasswordService.validateOtp(email, otp));
        verify(redisService).getValue(ForgotPasswordConstants.OTP_ATTEMPTS_REDIS_KEY_PREFIX + email);
    }

    @Test
    void testConsumeOtp_ValidOtp() {
        when(redisService.getValue(ForgotPasswordConstants.OTP_REDIS_KEY_PREFIX + email)).thenReturn(otp);
        when(redisService.getValue(ForgotPasswordConstants.OTP_ATTEMPTS_REDIS_KEY_PREFIX + email)).thenReturn("0");

        boolean result = forgotPasswordService.consumeOtp(email, otp);
        assertTrue(result);
        verify(redisService).delete(ForgotPasswordConstants.OTP_REDIS_KEY_PREFIX + email);
    }

    @Test
    void testConsumeOtp_InvalidOtp() {
        when(redisService.getValue(ForgotPasswordConstants.OTP_REDIS_KEY_PREFIX + email)).thenReturn(otp);
        when(redisService.getValue(ForgotPasswordConstants.OTP_ATTEMPTS_REDIS_KEY_PREFIX + email)).thenReturn("0");

        boolean result = forgotPasswordService.consumeOtp(email, "wrongOtp");
        assertFalse(result);
        verify(redisService, never()).delete(anyString());
        verify(redisService).save(
                eq(ForgotPasswordConstants.OTP_ATTEMPTS_REDIS_KEY_PREFIX + email),
                eq("1"),
                eq(ForgotPasswordConstants.OTP_TTL_MINUTES),
                eq(TimeUnit.MINUTES)
        );
    }

    @Test
    void testRequestOtp_Success() throws MessagingException {
        UserEntity user = new UserEntity();
        user.setEmail(email);
        when(userService.getUserByEmail(email)).thenReturn(user);
        when(redisService.getValue(ForgotPasswordConstants.OTP_REDIS_KEY_PREFIX + email)).thenReturn(null);
        doNothing().when(emailService).sendEmailTemplate(any(EmailRequestDTO.class));

        forgotPasswordService.requestOtp(email);

        verify(redisService).save(
                eq(ForgotPasswordConstants.OTP_REDIS_KEY_PREFIX + email),
                anyString(),
                eq(ForgotPasswordConstants.OTP_TTL_MINUTES),
                eq(TimeUnit.MINUTES)
        );
        verify(redisService).save(
                eq(ForgotPasswordConstants.OTP_STATUS_REQUEST_PREFIX + email),
                eq(ForgotPasswordConstants.OTP_STATUS_PENDING),
                eq(ForgotPasswordConstants.OTP_TTL_MINUTES),
                eq(TimeUnit.MINUTES)
        );
        verify(emailService).sendEmailTemplate(argThat(dto ->
                email.equals(dto.getTo()) &&
                        dto.getCode() != null &&
                        dto.getCode().length() == ForgotPasswordConstants.DEFAULT_OTP_LENGTH
        ));
    }

    @Test
    void testRequestOtp_ActiveOtpExists() throws MessagingException {
        when(redisService.getValue(ForgotPasswordConstants.OTP_REDIS_KEY_PREFIX + email)).thenReturn(otp);

        assertThrows(IllegalStateException.class, () -> forgotPasswordService.requestOtp(email));
        verify(emailService, never()).sendEmailTemplate(any(EmailRequestDTO.class));
        verify(userService, never()).getUserByEmail(anyString());
    }

    @Test
    void testRequestOtp_EmailServiceThrowsMessagingException() throws MessagingException {
        UserEntity user = new UserEntity();
        user.setEmail(email);
        when(userService.getUserByEmail(email)).thenReturn(user);
        when(redisService.getValue(ForgotPasswordConstants.OTP_REDIS_KEY_PREFIX + email)).thenReturn(null);
        doThrow(new MessagingException("Email error")).when(emailService).sendEmailTemplate(any(EmailRequestDTO.class));

        assertThrows(ResourceNotFoundException.class, () -> forgotPasswordService.requestOtp(email));

        verify(redisService).save(
                eq(ForgotPasswordConstants.OTP_REDIS_KEY_PREFIX + email),
                anyString(),
                eq(ForgotPasswordConstants.OTP_TTL_MINUTES),
                eq(TimeUnit.MINUTES)
        );
        verify(redisService).save(
                eq(ForgotPasswordConstants.OTP_STATUS_REQUEST_PREFIX + email),
                eq(ForgotPasswordConstants.OTP_STATUS_PENDING),
                eq(ForgotPasswordConstants.OTP_TTL_MINUTES),
                eq(TimeUnit.MINUTES)
        );
        verify(emailService).sendEmailTemplate(any(EmailRequestDTO.class));
    }

    @Test
    void testVerifyOtp_ValidOtpAndPendingStatus() {
        when(redisService.getValue(ForgotPasswordConstants.OTP_REDIS_KEY_PREFIX + email)).thenReturn(otp);
        when(redisService.getValue(ForgotPasswordConstants.OTP_STATUS_REQUEST_PREFIX + email))
                .thenReturn(ForgotPasswordConstants.OTP_STATUS_PENDING);
        when(redisService.getValue(ForgotPasswordConstants.OTP_ATTEMPTS_REDIS_KEY_PREFIX + email)).thenReturn("0");

        VerifyOtpResponse response = forgotPasswordService.verifyOtp(email, otp);
        assertTrue(response.isValid());
        verify(redisService).save(
                eq(ForgotPasswordConstants.OTP_STATUS_REQUEST_PREFIX + email),
                eq(ForgotPasswordConstants.OTP_STATUS_ACTIVE),
                eq(ForgotPasswordConstants.OTP_TTL_MINUTES),
                eq(TimeUnit.MINUTES)
        );
    }

    @Test
    void testVerifyOtp_InvalidOtp() {
        when(redisService.getValue(ForgotPasswordConstants.OTP_REDIS_KEY_PREFIX + email)).thenReturn(otp);
        when(redisService.getValue(ForgotPasswordConstants.OTP_ATTEMPTS_REDIS_KEY_PREFIX + email)).thenReturn("0");
        when(redisService.getValue(ForgotPasswordConstants.OTP_STATUS_REQUEST_PREFIX + email))
                .thenReturn(ForgotPasswordConstants.OTP_STATUS_PENDING);

        assertThrows(OtpExpiredException.class, () -> forgotPasswordService.verifyOtp(email, "wrongOtp"));
        verify(redisService).save(
                eq(ForgotPasswordConstants.OTP_ATTEMPTS_REDIS_KEY_PREFIX + email),
                eq("1"),
                eq(ForgotPasswordConstants.OTP_TTL_MINUTES),
                eq(TimeUnit.MINUTES)
        );
    }

    @Test
    void testVerifyOtp_InvalidStatus() {
        when(redisService.getValue(ForgotPasswordConstants.OTP_REDIS_KEY_PREFIX + email)).thenReturn(otp);
        when(redisService.getValue(ForgotPasswordConstants.OTP_STATUS_REQUEST_PREFIX + email))
                .thenReturn(ForgotPasswordConstants.OTP_STATUS_ACTIVE);
        when(redisService.getValue(ForgotPasswordConstants.OTP_ATTEMPTS_REDIS_KEY_PREFIX + email)).thenReturn("0");

        assertThrows(OtpExpiredException.class, () -> forgotPasswordService.verifyOtp(email, otp));
    }

    @Test
    void testResetPassword_Success() {
        UserEntity user = new UserEntity();
        user.setEmail(email);
        ResetPasswordRequest request = ResetPasswordRequest.builder()
                .email(email)
                .otp(otp)
                .newPassword("newPassword")
                .build();

        when(redisService.getValue(ForgotPasswordConstants.OTP_STATUS_REQUEST_PREFIX + email))
                .thenReturn(ForgotPasswordConstants.OTP_STATUS_ACTIVE);
        when(redisService.getValue(ForgotPasswordConstants.OTP_REDIS_KEY_PREFIX + email)).thenReturn(otp);
        when(redisService.getValue(ForgotPasswordConstants.OTP_ATTEMPTS_REDIS_KEY_PREFIX + email)).thenReturn("0");
        when(userService.getUserByEmail(email)).thenReturn(user);
        when(passwordEncoder.encode(anyString())).thenReturn(encodedPassword);
        when(userRepository.save(any(UserEntity.class))).thenReturn(user);

        forgotPasswordService.resetPassword(request);

        verify(userRepository).save(argThat(savedUser -> encodedPassword.equals(savedUser.getPassword())));
        verify(redisService).save(
                eq(ForgotPasswordConstants.OTP_STATUS_REQUEST_PREFIX + email),
                eq(ForgotPasswordConstants.OTP_STATUS_INACTIVE),
                eq(ForgotPasswordConstants.OTP_TTL_MINUTES),
                eq(TimeUnit.MINUTES)
        );
        verify(redisService).delete(ForgotPasswordConstants.OTP_REDIS_KEY_PREFIX + email);
    }

    @Test
    void testResetPassword_InvalidStatus() {
        ResetPasswordRequest request = ResetPasswordRequest.builder()
                .email(email)
                .otp(otp)
                .newPassword("newPassword")
                .build();

        when(redisService.getValue(ForgotPasswordConstants.OTP_STATUS_REQUEST_PREFIX + email))
                .thenReturn(ForgotPasswordConstants.OTP_STATUS_PENDING);

        assertThrows(OtpExpiredException.class, () -> forgotPasswordService.resetPassword(request));
        verify(userService, never()).getUserByEmail(anyString());
        verify(userRepository, never()).save(any());
        verify(redisService, never()).delete(anyString());
    }

    @Test
    void testResetPassword_InvalidOtp() {
        ResetPasswordRequest request = ResetPasswordRequest.builder()
                .email(email)
                .otp("wrongOtp")
                .newPassword("newPassword")
                .build();

        when(redisService.getValue(ForgotPasswordConstants.OTP_STATUS_REQUEST_PREFIX + email))
                .thenReturn(ForgotPasswordConstants.OTP_STATUS_ACTIVE);
        when(redisService.getValue(ForgotPasswordConstants.OTP_REDIS_KEY_PREFIX + email)).thenReturn(otp);
        when(redisService.getValue(ForgotPasswordConstants.OTP_ATTEMPTS_REDIS_KEY_PREFIX + email)).thenReturn("0");

        forgotPasswordService.resetPassword(request);

        verify(userService, never()).getUserByEmail(anyString());
        verify(userRepository, never()).save(any());
        verify(redisService, never()).delete(anyString());
        verify(redisService, never()).save(eq(ForgotPasswordConstants.OTP_STATUS_REQUEST_PREFIX + email), anyString(), anyInt(), any(TimeUnit.class));
        verify(redisService).save(
                eq(ForgotPasswordConstants.OTP_ATTEMPTS_REDIS_KEY_PREFIX + email),
                eq("1"),
                eq(ForgotPasswordConstants.OTP_TTL_MINUTES),
                eq(TimeUnit.MINUTES)
        );
    }
}