package com.fpt.evcare.constants;

public class VehiclePartConstants {

    // Success message
    public static final String MESSAGE_SUCCESS_SHOWING_VEHICLE_PART = "Lấy phụ tùng thành công";
    public static final String MESSAGE_SUCCESS_SHOWING_VEHICLE_PART_LIST = "Lấy danh sách phụ tùng thành công";
    public static final String MESSAGE_SUCCESS_CREATING_VEHICLE_PART = "Tạo phụ tùng thành công";
    public static final String MESSAGE_SUCCESS_UPDATING_VEHICLE_PART = "Cập nhật phụ tùng thành công";
    public static final String MESSAGE_SUCCESS_DELETING_VEHICLE_PART = "Xóa phụ tùng thành công";
    public static final String MESSAGE_SUCCESS_RESTORING_VEHICLE_PART = "Khôi phục phụ tùng thành công";

    // Failed message
    public static final String MESSAGE_ERR_VEHICLE_PART_NOT_FOUND = "Không tìm thấy phụ tùng";
    public static final String MESSAGE_ERR_VEHICLE_PART_LIST_NOT_FOUND = "Không tìm thấy danh sách phụ tùng";
    public static final String MESSAGE_ERR_DUPLICATED_VEHICLE_PART = "Phụ tùng này đã tồn tại";

    // Error Logs
    public static final String LOG_ERR_VEHICLE_PART_NOT_FOUND = "Không tìm thấy phụ tùng với id: {}";
    public static final String LOG_ERR_DUPLICATED_VEHICLE_PART = "Phụ tùng này đã tồn tại: {}";

    // Info Logs
    public static final String LOG_INFO_SHOWING_VEHICLE_PART = "Đang lấy phụ tùng với id: {}";
    public static final String LOG_INFO_SHOWING_VEHICLE_PART_LIST = "Đang lấy danh sách phụ tùng";
    public static final String LOG_INFO_CREATING_VEHICLE_PART = "Đang tạo phụ tùng: {}";
    public static final String LOG_INFO_UPDATING_VEHICLE_PART = "Đang cập nhật phụ tùng: {}";
    public static final String LOG_INFO_DELETING_VEHICLE_PART = "Đang xóa phụ tùng: {}";
    public static final String LOG_INFO_RESTORING_VEHICLE_PART = "Đang khôi phục phụ tùng với id: {}";

    // Success Logs
    public static final String LOG_SUCCESS_SHOWING_VEHICLE_PART = "Lấy phụ tùng thành công";
    public static final String LOG_SUCCESS_SHOWING_VEHICLE_PART_LIST = "Lấy danh sách phụ tùng thành công";
    public static final String LOG_SUCCESS_CREATING_VEHICLE_PART = "Tạo phụ tùng thành công";
    public static final String LOG_SUCCESS_UPDATING_VEHICLE_PART = "Cập nhật phụ tùng thành công";
    public static final String LOG_SUCCESS_DELETING_VEHICLE_PART = "Xóa phụ tùng thành công";
    public static final String LOG_SUCCESS_RESTORING_VEHICLE_PART = "Khôi phục phụ tùng thành công";

    // Endpoint
    public static final String BASE_URL = EndpointConstants.V1.API + "/vehicle-part";
    public static final String VEHICLE_PART_LIST = "/";
    public static final String VEHICLE_PART = "/{id}";
    public static final String VEHICLE_PART_UPDATE = "/{id}";
    public static final String VEHICLE_PART_DELETE = "/{id}";
    public static final String VEHICLE_PART_RESTORE = "/restore/{id}";
    public static final String VEHICLE_PART_CREATION = "/";
}
