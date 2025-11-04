package com.fpt.evcare.constants;

public class AuthConstants {
    public static final String APP_NAME  = "EVCare";

    // Log Messages
    public static final String LOG_SUCCESS_ACCOUNT_LOGIN = "Account {} is attempting to log in.";
    public static final String LOG_SUCCESS_ACCOUNT_REGISTER = "Account {} is attempting to register.";

    // Success Messages
    public static final String MESSAGE_SUCCESS_ACCOUNT_LOGIN = "Đăng nhập thành công";
    public static final String MESSAGE_SUCCESS_VALIDATE_TOKEN= "Xác thực token thành công";
    public static final String MESSAGE_SUCCESS_ACCOUNT_REGISTER = "Đăng ký tài khoản thành công";
    public static final String MESSAGE_SUCCESS_ACCOUNT_LOGOUT = "Đăng xuất tài khoản thành công";
    public static final String MESSAGE_SUCCESS_GOOGLE_LOGIN = "Đăng nhập bằng Google thành công";

    // Error Messages
    public static final String MESSAGE_ERR_INVALID_PASSWORD = "Mật khẩu không đúng.";
    public static final String MESSAGE_ERR_TOKEN_DISABLED = "Token không tồn tại.";

    // Additional log messages
    public static final String LOG_INFO_LOGIN_USER = "Login - User: {}, Role: {}, isAdmin: {}";
    public static final String LOG_INFO_STAFF_LOGGED_OUT = "⚠️ Staff {} logged out, set to OFFLINE";
    public static final String LOG_INFO_CUSTOMER_LOGGED_OUT = "⚠️ Customer {} logged out, set to OFFLINE";
    public static final String LOG_ERR_ERROR_UPDATING_OFFLINE_STATUS = "❌ Error updating offline status during logout: {}";
    public static final String LOG_INFO_USER_LOGGED_OUT_SUCCESSFULLY = "User with ID {} logged out successfully";
    public static final String LOG_ERR_FAILED_GET_USER_FROM_TOKEN = "Failed to get user from token: {}";
    public static final String LOG_INFO_SAVED_USER_FROM_GOOGLE_LOGIN = "Saved user from Google login: {}";

    public static final String BASE_URL = EndpointConstants.V1.API + "/auth";
    public static final String LOGIN = "/login";
    public static final String REGISTER = "/register";
    public static final String REFRESH = "/refresh";
    public static final String VALID = "/valid_token";
    public static final String USER_TOKEN = "/user/token";
    public static final String GET_USER_INFO = "/api/v1/auth/user";
    public static final String LOGIN_GOOGLE = "/oauth2/authorization/google";
    public static final String LOGOUT_GOOGLE = "/api/v1/auth/logout";
    public static final String LOGOUT = "/logout";



}
