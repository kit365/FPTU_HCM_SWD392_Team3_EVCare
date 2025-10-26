package com.fpt.evcare.constants;

public class UserConstants {

    //Sucess message
    public static final String MESSAGE_SUCCESS_SHOWING_USER = "Lấy danh sách người dùng thành công";
    public static final String MESSAGE_SUCCESS_CREATING_USER = "Tạo người dùng thành công";
    public static final String MESSAGE_SUCCESS_UPDATING_USER = "Cập nhật người dùng thành công";
    public static final String MESSAGE_SUCCESS_DELETING_USER = "Xóa người dùng thành công";
    public static final String MESSAGE_SUCCESS_SHOWING_USER_PROFILE = "Lấy thông tin cá nhân người dùng thành công";

    //Failed message
    public static final String MESSAGE_ERR_USER_NOT_FOUND = "Không tìm thấy người dùng";
    public static final String MESSAGE_ERR_USER_LIST_NOT_FOUND = "Danh sách người dùng trống";
    public static final String MESSAGE_ERR_DUPLICATED_USER_EMAIL = "Email này đã tồn tại";
    public static final String MESSAGE_ERR_DUPLICATED_USERNAME = "Username này đã tồn tại";
    public static final String MESSAGE_ERR_USER_DELETED = "Tài khoản đã bị xóa.";
    public static final String MESSAGE_ERR_DUPLICATED_USER_PHONE = "Số điện thoại này đã tồn tại";
    public static final String MESSAGE_ERR_USER_ROLE_NOT_PROPER = "Người dùng có vai trò không hợp lệ.";
    public static final String MESSAGE_ERR_USER_NOT_EXIST = "Người dùng không tồn tại";

    //Log message

    //Error log
    public static final String LOG_ERR_USER_NOT_FOUND = "Người dùng không tồn tại: {}";
    public static final String LOG_ERR_USER_LIST_NOT_FOUND = "Danh sách người dùng trống: {}";
    public static final String LOG_ERR_DUPLICATED_USER_EMAIL = "Email này đã tồn tại: {}";
    public static final String LOG_ERR_DUPLICATED_USERNAME = "Username này đã tồn tại: {}";
    public static final String LOG_ERR_DUPLICATED_USER_PHONE = "Số điện thoại này đã tồn tại: {}";
    public static final String LOG_ERR_USER_ROLE_NOT_PROPER = "Người dùng vai trò không hợp lệ: {} ";

    //Success log
    public static final String LOG_SUCCESS_SHOWING_USER = "Đang lấy thông tin người dùng: {}";
    public static final String LOG_SUCCESS_SHOWING_USER_LIST = "Đang lấy danh sách thông tin người dùng: {}";
    public static final String LOG_SUCCESS_CREATING_USER = "Đang tạo thông tin người dùng: {}";
    public static final String LOG_SUCCESS_UPDATING_USER = "Đang cập nhật thông tin người dùng: {}";
    public static final String LOG_SUCCESS_DELETING_USER = "Đang xóa người dùng: {}";
    public static final String LOG_SUCCESS_RESTORING_USER = "Đang khôi phục người dùng: {}";
    public static final String LOG_SUCCESS_VALIDATION_USER_ROLE = "Người dùng có vai trò hợp lệ: {}";

    public static final String DEFAULT_PAGE_SIZE = "10";
    public static final String DEFAULT_PAGE_NUMBER = "0";


    public static final String BASE_URL = EndpointConstants.V1.API + "/user";

    public static final String USER_LIST= "/";
    public static final String USER = "/{id}";
    public static final String USER_UPDATE = "/{id}";
    public static final String USER_DELETE = "/{id}";
    public static final String USER_RESTORE = "/restore/{id}";
    public static final String USER_CREATION = "/";
    public static final String USER_PROFILE = "/profile";
}
