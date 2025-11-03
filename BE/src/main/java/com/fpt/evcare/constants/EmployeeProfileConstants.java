package com.fpt.evcare.constants;

public class EmployeeProfileConstants {
    //Success message
    public static final String MESSAGE_SUCCESS_SHOWING_EMPLOYEE_PROFILE_LIST = "Lấy danh sách hồ sơ nhân viên thành công";
    public static final String MESSAGE_SUCCESS_SHOWING_EMPLOYEE_PROFILE = "Lấy thông tin hồ sơ nhân viên thành công";
    public static final String MESSAGE_SUCCESS_CREATING_EMPLOYEE_PROFILE = "Tạo hồ sơ nhân viên thành công";
    public static final String MESSAGE_SUCCESS_UPDATING_EMPLOYEE_PROFILE = "Cập nhật hồ sơ nhân viên thành công";
    public static final String MESSAGE_SUCCESS_DELETING_EMPLOYEE_PROFILE = "Xóa hồ sơ nhân viên thành công";
    public static final String MESSAGE_SUCCESS_RESTORING_EMPLOYEE_PROFILE = "Khôi phục hồ sơ nhân viên thành công";

    //Error message
    public static final String MESSAGE_ERROR_EMPLOYEE_PROFILE_NOT_FOUND = "Hồ sơ nhân viên không tồn tại";

    //Base URL
    public static final String BASE_URL = EndpointConstants.V1.API + "/employee-profile";
    
    //Endpoints
    public static final String EMPLOYEE_PROFILE_LIST = "/";
    public static final String EMPLOYEE_PROFILE = "/{id}";
    public static final String EMPLOYEE_PROFILE_BY_USER = "/user/{userId}";
    public static final String EMPLOYEE_PROFILE_UPDATE = "/{id}";
    public static final String EMPLOYEE_PROFILE_DELETE = "/{id}";
    public static final String EMPLOYEE_PROFILE_RESTORE = "/restore/{id}";
    public static final String EMPLOYEE_PROFILE_CREATION = "/";
}
