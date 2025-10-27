package com.fpt.evcare.exception;

import com.fpt.evcare.base.ApiResponse;
import com.fpt.evcare.constants.VehiclePartConstants;
import io.swagger.v3.oas.annotations.Hidden;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@Hidden
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ============================
    // Security & Authorization Exceptions
    // ============================
    @ExceptionHandler(AuthorizationDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuthorizationDeniedException(AuthorizationDeniedException ex) {
        if (log.isWarnEnabled()) {
            log.warn("Access denied: {}", ex.getMessage());
        }
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.<Void>builder()
                        .success(false)
                        .message("Không được phép truy cập")
                        .build()
                );
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDeniedException(AccessDeniedException ex) {
        if (log.isWarnEnabled()) {
            log.warn("Access denied: {}", ex.getMessage());
        }
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.<Void>builder()
                        .success(false)
                        .message("Không được phép truy cập")
                        .build()
                );
    }

    // ============================
    // Validation & Argument Exceptions
    // ============================
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgumentException(IllegalArgumentException ex) {
        if (log.isInfoEnabled()) {
            log.info("Invalid argument: {}", ex.getMessage());
        }
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.<Void>builder()
                        .success(false)
                        .message(ex.getMessage())
                        .build()
                );
    }

    // ============================
    // Resource & Authentication Exceptions
    // ============================
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFoundException(ResourceNotFoundException ex) {
        if (log.isInfoEnabled()) {
            log.info("Resource not found: {}", ex.getMessage());
        }
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.<Void>builder()
                        .success(false)
                        .message(ex.getMessage())
                        .build()
                );
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleInvalidCredentialsException(InvalidCredentialsException ex) {
        if (log.isInfoEnabled()) {
            log.info("Invalid credentials: {}", ex.getMessage());
        }
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.<Void>builder()
                        .success(false)
                        .message(ex.getMessage())
                        .build()
                );
    }

    @ExceptionHandler(LockedException.class)
    public ResponseEntity<ApiResponse<Void>> handleLockedException(LockedException ex) {
        if (log.isInfoEnabled()) {
            log.info("Account locked: {}", ex.getMessage());
        }
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.<Void>builder()
                        .success(false)
                        .message(ex.getMessage())
                        .build()
                );
    }

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<ApiResponse<Void>> handleLockedException(DisabledException ex) {
        if (log.isInfoEnabled()) {
            log.info("Exception caught: {}", ex.getClass().getSimpleName(), ex);
        }

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.<Void>builder()
                        .success(false)
                        .message(ex.getMessage())
                        .build()
                );
    }

    @ExceptionHandler(OtpExpiredException.class)
    public ResponseEntity<ApiResponse<Void>> handleOtpExpiredException(OtpExpiredException ex) {
        if (log.isInfoEnabled()) {
            log.info("OTPExpired caught: {}", ex.getClass().getSimpleName(), ex);
        }

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.<Void>builder()
                        .success(false)
                        .message(ex.getMessage())
                        .build()
                );
    }

    // ============================
    // State & Operational Exceptions
    // ============================
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiResponse<Void>> handleOtpExpiredException(IllegalStateException ex) {
        if (log.isInfoEnabled()) {
            log.info("IllegalStateException caught: {}", ex.getClass().getSimpleName(), ex);
        }

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ApiResponse.<Void>builder()
                        .success(false)
                        .message(ex.getMessage())
                        .build()
                );
    }

    @ExceptionHandler(UnsupportedOperationException.class)
    public ResponseEntity<ApiResponse<Void>> handleUnsupportedOperationException(UnsupportedOperationException ex) {
        log.error("Unsupported operation encountered: {}", ex.getMessage(), ex);

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.<Void>builder()
                        .success(false)
                        .message(ex.getMessage())
                        .build()
                );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleMethodArgumentNotValidException(MethodArgumentNotValidException ex) {
        if (log.isErrorEnabled()) {
            log.error("MethodArgumentNotValidException caught: {}", ex.getMessage(), ex);
        }

        // Cắt chuỗi, chỉ lấy message của validation
        String errorMessage = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(DefaultMessageSourceResolvable::getDefaultMessage)
                .collect(Collectors.joining(", "));

        log.error(errorMessage);

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.<Void>builder()
                        .success(false)
                        .message(errorMessage)
                        .build()
                );
    }

    // ============================
    // Business Validation Exceptions
    // ============================
    @ExceptionHandler(EntityValidationException.class)
    public ResponseEntity<ApiResponse<Void>> handleEntityValidationException(EntityValidationException ex) {
        if (log.isErrorEnabled()) {
            log.error("EntityValidationException caught: {}", ex.getMessage(), ex);
        }

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.<Void>builder()
                        .success(false)
                        .message(ex.getMessage())
                        .build()
                );
    }

    @ExceptionHandler(OptimisticLockException.class)
    public ResponseEntity<ApiResponse<Void>> handleOptimisticLockException(OptimisticLockException ex) {
        if (log.isWarnEnabled()) {
            log.warn("OptimisticLockException caught: {}", ex.getMessage());
        }

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ApiResponse.<Void>builder()
                        .success(false)
                        .message(VehiclePartConstants.MESSAGE_ERR_CONCURRENT_UPDATE)
                        .build()
                );
    }

    @ExceptionHandler(UserValidationException.class)
    public ResponseEntity<ApiResponse<Void>> handleUserValidationException(UserValidationException ex) {
        if (log.isErrorEnabled()) {
            log.error("UserValidationException caught: {}", ex.getMessage(), ex);
        }

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.<Void>builder()
                        .success(false)
                        .message(ex.getMessage())
                        .build()
                );
    }

    @ExceptionHandler(VehiclePartCategoryException.class)
    public ResponseEntity<ApiResponse<Void>> handleVehiclePartCategoryException(VehiclePartCategoryException ex) {
        if (log.isErrorEnabled()) {
            log.error("VehiclePartCategoryException caught: {}", ex.getMessage(), ex);
        }

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.<Void>builder()
                        .success(false)
                        .message(ex.getMessage())
                        .build()
                );
    }

    @ExceptionHandler(VehicleTypeValidationException.class)
    public ResponseEntity<ApiResponse<Void>> handleVehicleTypeValidationException(VehicleTypeValidationException ex) {
        if (log.isErrorEnabled()) {
            log.error("VehicleTypeValidationException caught: {}", ex.getMessage(), ex);
        }

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.<Void>builder()
                        .success(false)
                        .message(ex.getMessage())
                        .build()
                );
    }

    @ExceptionHandler(VehiclePartValidationException.class)
    public ResponseEntity<ApiResponse<Void>> handleVehiclePartValidationException(VehiclePartValidationException ex) {
        if (log.isErrorEnabled()) {
            log.error("VehiclePartValidationException caught: {}", ex.getMessage(), ex);
        }

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.<Void>builder()
                        .success(false)
                        .message(ex.getMessage())
                        .build()
                );
    }

    @ExceptionHandler(AppointmentValidationException.class)
    public ResponseEntity<ApiResponse<Void>> handleAppointmentValidationException(AppointmentValidationException ex) {
        if (log.isErrorEnabled()) {
            log.error("AppointmentValidationException caught: {}", ex.getMessage(), ex);
        }

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.<Void>builder()
                        .success(false)
                        .message(ex.getMessage())
                        .build()
                );
    }

    @ExceptionHandler(JWTInitializationException.class)
    public ResponseEntity<ApiResponse<Void>> handleJWTInitializationException(JWTInitializationException ex) {
        if (log.isErrorEnabled()) {
            log.error("JWTInitialization caught: {}", ex.getMessage(), ex);
        }

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.<Void>builder()
                        .success(false)
                        .message(ex.getMessage())
                        .build()
                );
    }

    // ============================
    // General Exception Handler (Fallback)
    // ============================
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleAllExceptions(Exception ex) {
        if (log.isErrorEnabled()) {
            log.error("An unexpected error occurred: {}", ex.getMessage());
        }
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.<Void>builder()
                        .success(false)
                        .message("Lỗi hệ thống, vui lòng thử lại sau")
                        .build()
                );
    }

}
