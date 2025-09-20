package com.fpt.evcare.constants;

public class RoleConstants {
    //Success Messages
    public static final String SUCCESS_CREATE_ROLE = "Tạo role thành công.";
    public static final String SUCCESS_UPDATE_ROLE = "Cập nhật role thành công.";
    public static final String SUCCESS_GET_ALL_ROLE = "Lấy danh sách role thành công.";
    public static final String SUCCESS_GET_ROLE_BY_ID = "Lấy role theo ID thành công.";

    // Error Messages
    public static final String ERR_ROLE_NOT_EXISTED = "Role không tồn tại.";
    public static final String ERR_ROLE_NAME_NOT_EXISTED = "Tên Role không tồn tại.";



    public static final String CREATE_ROLE = "/";
    public static final String UPDATE_ROLE = "/{roleId}";
    public static final String DELETE_ROLE = "/{roleId}";
    public static final String GET_ALL_ROLE = "/";
    public static final String GET_ROLE_BY_ID = "/{roleId}";

    public static final String BASE_URL = EndpointConstants.V1.API + "/role";

}
