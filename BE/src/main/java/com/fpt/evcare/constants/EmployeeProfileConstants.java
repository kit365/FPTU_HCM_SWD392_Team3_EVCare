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
    public static final String MESSAGE_ERR_EMPLOYEE_PROFILE_NOT_FOUND_FOR_USER = "Không tìm thấy hồ sơ nhân viên cho người dùng này";

    //Log messages
    public static final String LOG_ERR_USER_NOT_FOUND = "User not found with id: {}";
    public static final String LOG_ERR_CONVERTING_CERTIFICATIONS_JSON = "Error converting certifications to JSON: {}";
    public static final String LOG_ERR_PARSING_CERTIFICATIONS_JSON = "Error parsing certifications JSON: {}";
    public static final String LOG_ERR_EMPLOYEE_PROFILE_NOT_FOUND_BY_ID = "Employee profile not found with id: {}";
    public static final String LOG_ERR_EMPLOYEE_PROFILE_NOT_FOUND_BY_USER_ID = "Employee profile not found for user id: {}";
    public static final String LOG_ERR_PARSING_CERTIFICATIONS_FOR_SEARCH = "Error parsing certifications for search: {}";
    public static final String LOG_WARN_ERROR_GETTING_PAGEABLE_INFO = "Error getting pageable info: {}";
    public static final String LOG_INFO_NO_EMPLOYEE_PROFILES_FOUND = "No employee profiles found - returning empty page";
    public static final String LOG_INFO_SEARCHING_EMPLOYEE_PROFILES = "Searching employee profiles with keyword: {}";
    public static final String LOG_ERR_SEARCHING_EMPLOYEE_PROFILES = "Error searching employee profiles: {}";

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
