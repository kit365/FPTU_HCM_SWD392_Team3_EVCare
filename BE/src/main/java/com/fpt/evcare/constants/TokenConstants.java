package com.fpt.evcare.constants;

public class TokenConstants {
    public static final String ACCESS_PREFIX = "ACCESS_TOKEN:";
    public static final String REFRESH_PREFIX = "REFRESH_TOKEN:";

    //Error Messages
    public static final String MESSAGE_ERR_TOKEN_DISABLED = "Token không tồn tại.";
    public static final String MESSAGE_ERR_TOKEN_INVALID =  "Refresh token không hợp lệ hoặc đã hết hạn";

    public static final String MESSAGE_ERR_REFRESH_TOKEN_EXPIRED = "Refresh token đã hết hạn";
}
