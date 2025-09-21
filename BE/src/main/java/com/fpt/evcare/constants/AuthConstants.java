package com.fpt.evcare.constants;

public class AuthConstants {
    public static final String APP_NAME  = "EVCare";

    // Log Messages
    public static final String LOG_SUCCESS_ACCOUNT_LOGIN = "Account {} is attempting to log in.";

    // Success Messages
    public static final String MESSAGE_SUCCESS_ACCOUNT_LOGIN = "Đăng nhập thành công";

    // Error Messages
    public static final String MESSAGE_ERR_INVALID_PASSWORD = "Mật khẩu không đúng.";



    public static final String BASE_URL = EndpointConstants.V1.API + "/auth";
    public static final String LOGIN = "/login";
}
