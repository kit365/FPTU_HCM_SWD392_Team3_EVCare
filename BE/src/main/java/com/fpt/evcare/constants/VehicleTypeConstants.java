package com.fpt.evcare.constants;

public class VehicleTypeConstants {

    //Enum for service name
    public static final String PREFIX_SERVICE_NAME = "Dịch vụ cho xe ";

    // Success message
    public static final String MESSAGE_SUCCESS_SHOWING_VEHICLE_TYPE = "Lấy danh sách loại xe thành công";
    public static final String MESSAGE_SUCCESS_SHOWING_VEHICLE_TYPE_NAME_LIST = "Đang lấy danh sách tên loại xe";
    public static final String MESSAGE_SUCCESS_SHOWING_VEHICLE_TYPE_NAME_FOR_SERVICE_TYPE_LIST = "Đang lấy danh sách tên loại xe cho danh sách dịch vụ";
    public static final String MESSAGE_SUCCESS_CREATING_VEHICLE_TYPE = "Tạo loại xe thành công";
    public static final String MESSAGE_SUCCESS_UPDATING_VEHICLE_TYPE = "Cập nhật loại xe thành công";
    public static final String MESSAGE_SUCCESS_DELETING_VEHICLE_TYPE = "Xóa loại xe thành công";
    public static final String MESSAGE_SUCCESS_RESTORING_VEHICLE_TYPE = "Khôi phục loại xe thành công";


    // Failed message
    public static final String MESSAGE_ERR_VEHICLE_TYPE_NOT_FOUND = "Không tìm thấy loại xe";
    public static final String MESSAGE_ERR_VEHICLE_TYPE_LIST_NOT_FOUND = "Danh sách loại xe trống";
    public static final String MESSAGE_ERR_DUPLICATED_VEHICLE_TYPE_NAME = "Tên loại xe này đã tồn tại";
    public static final String MESSAGE_ERR_CAN_NOT_DELETE_VEHICLE_TYPE = "Không thể xóa mẫu xe này vì có cuộc hẹn đang trong quá trình thực hiện (IN_PROGRESS) sử dụng mẫu xe này";
    public static final String MESSAGE_ERR_CAN_NOT_UPDATE_VEHICLE_TYPE = "Không thể cập nhật mẫu xe này vì có cuộc hẹn đang trong quá trình thực hiện (IN_PROGRESS) sử dụng mẫu xe này hoặc dịch vụ của mẫu xe này";

    // Log message

    // Error log
    public static final String LOG_ERR_VEHICLE_TYPE_NOT_FOUND = "Loại xe không tồn tại: {}";
    public static final String LOG_ERR_VEHICLE_TYPE_LIST_NOT_FOUND = "Danh sách loại xe trống: {}";
    public static final String LOG_ERR_DUPLICATED_VEHICLE_TYPE_NAME = "Tên loại xe đã tồn tại: {}";
    public static final String LOG_ERR_CAN_NOT_DELETE_VEHICLE_TYPE = "Không thể xóa mẫu xe vì có appointment IN_PROGRESS: {}";
    public static final String LOG_ERR_CAN_NOT_UPDATE_VEHICLE_TYPE = "Không thể cập nhật mẫu xe vì có appointment IN_PROGRESS: {}";

    // Success log
    public static final String LOG_SUCCESS_SHOWING_VEHICLE_TYPE = "Đang lấy thông tin loại xe: {}";
    public static final String LOG_SUCCESS_SHOWING_VEHICLE_TYPE_LIST = "Đang lấy danh sách loại xe: {}";
    public static final String LOG_SUCCESS_CREATING_VEHICLE_TYPE = "Đang tạo loại xe: {}";
    public static final String LOG_SUCCESS_DELETING_VEHICLE_TYPE = "Đang xóa loại xe: {}";
    public static final String LOG_SUCCESS_RESTORING_VEHICLE_TYPE = "Đang khôi phục loại xe: {}";

    // Endpoint
    public static final String BASE_URL = EndpointConstants.V1.API + "/vehicle-type";
    public static final String VEHICLE_TYPE_LIST = "/";
    public static final String VEHICLE_TYPE_NAME_LIST = "/vehicle-type-name/";
    public static final String VEHICLE_TYPE_NAME_LIST_FOR_SERVICE_TYPE = "/service-type/name/";
    public static final String VEHICLE_TYPE = "/{id}";
    public static final String VEHICLE_TYPE_UPDATE = "/{id}";
    public static final String VEHICLE_TYPE_DELETE = "/{id}";
    public static final String VEHICLE_TYPE_RESTORE = "/restore/{id}";
    public static final String VEHICLE_TYPE_CREATION = "/";
}
