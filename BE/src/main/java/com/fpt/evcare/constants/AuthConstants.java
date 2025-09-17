package com.fpt.evcare.constants;

public class AuthConstants {

    // Log Messages
    public static final String LOG_ACCOUNT_LOGIN = "Account {} is attempting to log in.";


    // Success Messages
    public static final String SUCCESS_ACCOUNT_LOGIN = "Đăng nhập thành công";

    // Error Messages
    public static final String ERR_ACCOUNT_LOCKED = "Tài khoản {} đã bị khóa.";
    public static final String ERR_INVALID_PASSWORD = "Mật khẩu không đúng.";



    public static final String BASE_URL = EndpointConstants.V1.API + "/auth";
    public static final String LOGIN = "/login";
}
