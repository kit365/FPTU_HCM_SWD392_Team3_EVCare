package com.fpt.evcare.constants;

public class AuthConstants {

    // Log Messages
    public static final String LOG_ACCOUNT_LOGIN = "Account {} is attempting to log in.";
    public static final String LOG_ACCOUNT_REGISTER = "Account {} is attempting to register.";
    public static final String LOG_ACCOUNT_LOGOUT = "Account {} is attempting to log out.";
    public static final String LOG_ACCOUNT_PASSWORD_RESET = "Account {} is attempting to reset password.";
    public static final String LOG_ACCOUNT_PASSWORD_CHANGE = "Account {} is attempting to change password.";
    public static final String LOG_ACCOUNT_LOGIN_SUCCESS = "Đăng nhập thành công.";
    public static final String LOG_ACCOUNT_LOGIN_FAILURE = "Account {} failed to log in.";

    // Error Messages
    public static final String ERR_ACCOUNT_LOCKED = "Account is locked due to multiple failed login attempts.";
    public static final String ERR_INVALID_PASSWORD = "Mật khẩu không đúng.";

    public static final String BASE_URL = EndpointConstants.V1.API + "/auth";
    public static final String LOGIN = "/login";
}
