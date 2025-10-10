package com.fpt.evcare.serviceimpl;
import com.fpt.evcare.constants.ForgotPasswordConstants;
import com.fpt.evcare.dto.request.EmailRequestDTO;
import com.fpt.evcare.dto.request.ResetPasswordRequest;
import com.fpt.evcare.dto.response.VerifyOtpResponse;
import com.fpt.evcare.entity.UserEntity;
import com.fpt.evcare.exception.OtpExpiredException;
import com.fpt.evcare.exception.ResourceNotFoundException;
import com.fpt.evcare.repository.UserRepository;
import com.fpt.evcare.service.EmailService;
import com.fpt.evcare.service.ForgotPasswordService;
import com.fpt.evcare.service.RedisService;
import com.fpt.evcare.service.UserService;
import jakarta.mail.MessagingException;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.security.SecureRandom;
import java.util.concurrent.TimeUnit;

import static com.fpt.evcare.constants.ForgotPasswordConstants.OTP_ATTEMPTS_REDIS_KEY_PREFIX;

@Slf4j
@Service
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ForgotPasswordServiceImpl implements ForgotPasswordService {

    UserService userService;
    UserRepository userRepository;
    RedisService<String> redisService;
    PasswordEncoder passwordEncoder;
    EmailService emailService;
    SecureRandom random = new SecureRandom();


    @Override
    public String getRequestedOtpStatusKey(String email) {
        return ForgotPasswordConstants.OTP_STATUS_REQUEST_PREFIX + email;
    }

    @Override
    public String getKeyOtpRedis(String email) {
        return ForgotPasswordConstants.OTP_REDIS_KEY_PREFIX + email;
    }

    @Override
    public boolean hasActiveOtp(String email) {
        String key = getKeyOtpRedis(email);
        return redisService.getValue(key) != null;
    }


    @Override
    public boolean validateOtp(String email, String otp) {
        String attemptKey = OTP_ATTEMPTS_REDIS_KEY_PREFIX + email;
        String attemptsStr = redisService.getValue(attemptKey);
        int attempts = attemptsStr != null ? Integer.parseInt(attemptsStr) : 0;

        if (attempts >= ForgotPasswordConstants.OTP_MAX_ATTEMPTS) {
            log.warn(ForgotPasswordConstants.LOG_ERR_MESSAGE_OTP_MAX_ATTEMPTS, email);
            throw new IllegalStateException(ForgotPasswordConstants.MESSAGE_ERR_OTP_MAX_ATTEMPTS);
        }

        String storedOtp = redisService.getValue(getKeyOtpRedis(email));
        if (storedOtp != null && storedOtp.equals(otp)) {
            return true;
        }

        redisService.save(attemptKey, String.valueOf(attempts + 1), ForgotPasswordConstants.OTP_TTL_MINUTES, TimeUnit.MINUTES);
        log.warn("Invalid OTP attempt for email: {}, attempt count: {}", email, attempts + 1);
        return false;
    }


    @Override
    public boolean consumeOtp(String email, String otp) {
        if (validateOtp(email, otp)) {
            redisService.delete(getKeyOtpRedis(email));
            return true;
        }
        return false;
    }


    @Override
    public String generateOtp() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < ForgotPasswordConstants.DEFAULT_OTP_LENGTH; i++) {
            sb.append(random.nextInt(10));
        }
        return sb.toString();
    }

    @Override
    public void requestOtp(String email) {
        if (hasActiveOtp(email)) {
            log.warn(ForgotPasswordConstants.LOG_ERR_FORGOT_PASSWORD_REQUEST, email);
            throw new IllegalStateException(ForgotPasswordConstants.MESSAGE_ERR_OTP_ALREADY_REQUESTED);
        }
        UserEntity userEntity = userService.getUserByEmail(email);
        String otp = generateOtp();
        String key = getKeyOtpRedis(userEntity.getEmail());
        String keyStatus = getRequestedOtpStatusKey(userEntity.getEmail());
        redisService.save(key, otp, ForgotPasswordConstants.OTP_TTL_MINUTES, TimeUnit.MINUTES);
        redisService.save(keyStatus, ForgotPasswordConstants.OTP_STATUS_PENDING, ForgotPasswordConstants.OTP_TTL_MINUTES, TimeUnit.MINUTES);
        log.info(ForgotPasswordConstants.LOG_SUCCESS_FORGOT_PASSWORD_REQUEST, email);
        sendEmailOtp(email, otp, userEntity.getEmail());
    }

    private void sendEmailOtp(String email, String otp, String fullName) {
        try {
            EmailRequestDTO emailRequestDTO = EmailRequestDTO.builder()
                    .to(email)
                    .text("Chúng tôi đã nhận được yêu cầu thay đổi địa chỉ email cho tài khoản của bạn. Vui lòng sử dụng mã xác nhận bên dưới để xác nhận thay đổi.")
                    .subject("Xác thực thay đổi email")
                    .code(otp)
                    .fullName(fullName)
                    .build();
            emailService.sendEmailTemplate(emailRequestDTO);
        } catch (MessagingException e) {
            throw new ResourceNotFoundException(e.getMessage());
        }

    }





    @Override
    public VerifyOtpResponse verifyOtp(String email, String otp) {
        String statusKey = getRequestedOtpStatusKey(email);
        String currentStatus = redisService.getValue(statusKey);

        if (validateOtp(email, otp)) {
            if (ForgotPasswordConstants.OTP_STATUS_PENDING.equals(currentStatus)) {
                redisService.save(statusKey, ForgotPasswordConstants.OTP_STATUS_ACTIVE,
                        ForgotPasswordConstants.OTP_TTL_MINUTES, TimeUnit.MINUTES);
                log.info(ForgotPasswordConstants.LOG_SUCCESS_MESSAGE_FORGOT_PASSWORD_REQUEST, email);
                return VerifyOtpResponse.builder().isValid(true).build();
            } else {
                log.warn("OTP for email {} is valid but status is {}", email, currentStatus);
                throw new OtpExpiredException(ForgotPasswordConstants.MESSAGE_ERR_INVALID_OTP);
            }
        } else {
            throw new OtpExpiredException(ForgotPasswordConstants.MESSAGE_ERR_INVALID_OTP);
        }
    }



    @Override
    public void resetPassword(ResetPasswordRequest request) {
        String email = request.getEmail();
        String statusKey = getRequestedOtpStatusKey(email);
        String currentStatus = redisService.getValue(statusKey);

        if (ForgotPasswordConstants.OTP_STATUS_ACTIVE.equals(currentStatus)) {
            if(consumeOtp(request.getEmail(), request.getOtp())) {
                UserEntity userEntity = userService.getUserByEmail(email);
                userEntity.setPassword(passwordEncoder.encode(request.getNewPassword()));
                userRepository.save(userEntity);
                redisService.save(statusKey, ForgotPasswordConstants.OTP_STATUS_INACTIVE, ForgotPasswordConstants.OTP_TTL_MINUTES, TimeUnit.MINUTES);
                log.info(ForgotPasswordConstants.LOG_SUCCESS_PASSWORD_RESET, userEntity.getEmail());
            }
        } else {
            if (log.isDebugEnabled()) {
                log.debug(ForgotPasswordConstants.LOG_ERR_MESSAGE_INVALID_OTP + " (Status: {})", email, currentStatus);
            }
            throw new OtpExpiredException(ForgotPasswordConstants.MESSAGE_ERR_FORGOT_PASSWORD_REQUEST);
        }
    }


}
