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
