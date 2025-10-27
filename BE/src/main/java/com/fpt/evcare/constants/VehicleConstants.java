package com.fpt.evcare.constants;

public class VehicleConstants {
    //Success messages
    public static final String MESSAGE_SUCCESS_SHOWING_VEHICLE_PART = "Lấy phụ tùng thành công";
    public static final String MESSAGE_SUCCESS_CREATING_VEHICLE = "Tạo xe thành công";
    public static final String MESSAGE_SUCCESS_SHOWING_VEHICLE = "Lấy xe thành công";
    public static final String MESSAGE_SUCCESS_SHOWING_VEHICLE_LIST = "Lấy danh sách xe thành công";
    public static final String MESSAGE_SUCCESS_UPDATING_VEHICLE = "Cập nhật xe thành công";
    public static final String MESSAGE_SUCCESS_DELETING_VEHICLE = "Xóa xe thành công";
    public static final String MESSAGE_SUCCESS_RESTORING_VEHICLE = "Khôi phục xe thành công";



    //Error messages
    public static final String MESSAGE_ERROR_NOT_FOUND = "Không tìm thấy xe nào";
    public static final String MESSAGE_ERROR_VEHICLE_EXISTED = "Xe đã tồn tại";
    public static final String MESSAGE_ERROR_VIN_EXISTED = "Số khung xe đã tồn tại";
    public static final String MESSAGE_ERROR_PLATE_NUMBER_EXISTED = "Biển số xe đã tồn tại";
    public static final String MESSAGE_ERR_VEHICLE_NOT_FOUND = "Không tìm thấy hồ sơ xe";


    // Endpoint
    public static final String BASE_URL = EndpointConstants.V1.API + "/vehicle-profile";
    public static final String VEHICLE_LIST= "/";
    public static final String VEHICLE = "/{id}";
    public static final String VEHICLE_UPDATE = "/{id}";
    public static final String VEHICLE_DELETE = "/{id}";
    public static final String VEHICLE_CREATION = "/";
    public static final String VEHICLE_RESTORE = "/restore/{id}";
}
