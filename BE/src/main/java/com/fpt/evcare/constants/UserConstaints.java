package com.fpt.evcare.constants;

import org.springframework.stereotype.Component;

@Component
public class UserConstaints {

    //Sucess message
    public static final String SUCCESS_SHOWING_USER = "Lấy danh sách người dùng thành công";
    public static final String SUCCESS_CREATING_USER = "Tạo người dùng thành công";
    public static final String SUCCESS_UPDATING_USER = "Cập nhật người dùng thành công";
    public static final String SUCCESS_DELETING_USER = "Xóa người dùng thành công";

    //Failed message
    public static final String USER_NOT_FOUND = "Không tìm thấy người dùng";
    public static final String USER_LIST_NOT_FOUND = "Không tìm thấy danh sách người dùng";

    public static final String DUPLICATED_USER_EMAIL = "Email này đã tồn tại";
    public static final String DUPLICATED_USERNAME = "Username này đã tồn tại";
    public static final String MESSAGE_ERR_USER_DELETED = "Tài khoản đã bị xóa.";


    //Log message
    public static final String LOG_ERR_ACCOUNT_NOT_FOUND = "Tài khoản không tìm thấy hoặc không tồn tại, Tài khoản Email: {}";
    public static final String LOG_ERR_ACCOUNT_DELETED = "Tài khoản đã bị xóa, Tài khoản Email: {}";

    public static final String BASE_URL = EndpointConstants.V1.API + "/user";
    public static final String USER_LIST= "/";
    public static final String USER = "/{id}";
    public static final String USER_UPDATE = "/{id}";
    public static final String USER_DELETE = "/{id}";
    public static final String USER_CREATION = "/";
}
