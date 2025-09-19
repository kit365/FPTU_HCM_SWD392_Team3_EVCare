package com.fpt.evcare.constants;

public class ForgotPasswordConstants {

    public static final String BASE_URL = EndpointConstants.V1.API + "/forgot-password";

    // Endpoints
    public static final String REQUEST_OTP = "/request-otp";
    public static final String VERIFY_OTP = "/verify-otp";
    public static final String RESET_PASSWORD ="/reset-password";

    public static final int DEFAULT_OTP_LENGTH = 6;
    public static final long OTP_TTL_MINUTES = 5;
    public static final long OTP_MAX_ATTEMPTS = 3;
    public static final String OTP_REDIS_KEY_PREFIX = "otp:";
    public static final String OTP_ATTEMPTS_REDIS_KEY_PREFIX = "otp_attempts:";
    public static final String OTP_STATUS_REQUEST_PREFIX = "otp_requested:";
    public static final String OTP_STATUS_PENDING = "PENDING";
    public static final String OTP_STATUS_INACTIVE = "INACTIVE"; // Nếu cần dùng sau này
    public static final String OTP_STATUS_ACTIVE = "ACTIVE"; // Nếu cần dùng sau này
    public static final String OTP_STATUS_IS_USED = "USED"; // Nếu cần dùng sau này


    // Success Messages
    public static final String MESSAGE_SUCCESS_FORGOT_PASSWORD_REQUEST = "Gửi mã xác thực OTP thành công";
    public static final String MESSAGE_SUCCESS_OTP_VERIFIED = "Xác thực OTP thành công";
    public static final String MESSAGE_SUCCESS_PASSWORD_RESET = "Đặt lại mật khẩu thành công";

    // Error Messages
    public static final String MESSAGE_ERR_FORGOT_PASSWORD_REQUEST = "Xác thực OTP thất bại";
    public static final String MESSAGE_ERR_INVALID_OTP = "Mã OTP không hợp lệ hoặc đã hết hạn.";
    public static final String MESSAGE_ERR_OTP_ALREADY_REQUESTED = "Đã gửi mã OTP đến email. Vui lòng thử lại sau.";
    public static final String MESSAGE_ERR_OTP_MAX_ATTEMPTS = "Đã vượt quá số lần thử tối đa cho mã OTP.";


    // Log
    // Success Logs
    public static final String LOG_SUCCESS_FORGOT_PASSWORD_REQUEST = "Gửi mã xác thực OTP thành công cho email {}";
    public static final String LOG_SUCCESS_OTP_VERIFIED = "Xác thực OTP thành công cho email {}";
    public static final String LOG_SUCCESS_MESSAGE_FORGOT_PASSWORD_REQUEST = "Gửi mã xác thực OTP thành công đến email {}";
    public static final String LOG_SUCCESS_PASSWORD_RESET = "Đặt lại mật khẩu thành công cho email {}";
    // Error Logs
    public static final String LOG_ERR_FORGOT_PASSWORD_REQUEST = "Xác thực OTP thất bại cho email {}";
    public static final String LOG_ERR_OTP_ALREADY_REQUESTED = "Đã gửi mã OTP đến email {}. Vui lòng thử lại sau.";
    public static final String LOG_ERR_MESSAGE_INVALID_OTP = "Mã OTP không hợp lệ hoặc đã hết hạn, email {}";
    public static final String LOG_ERR_MESSAGE_FORGOT_PASSWORD_REQUEST = "Xác thực OTP thất bại cho email {}";
    public static final String LOG_ERR_MESSAGE_OTP_MAX_ATTEMPTS = "Đã vượt quá số lần thử tối đa cho mã OTP, email {}";
}
