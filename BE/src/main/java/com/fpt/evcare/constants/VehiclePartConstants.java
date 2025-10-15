package com.fpt.evcare.constants;

public class VehiclePartConstants {

    // Success message
    public static final String MESSAGE_SUCCESS_SHOWING_VEHICLE_PART = "Lấy phụ tùng thành công";
    public static final String MESSAGE_SUCCESS_SHOWING_VEHICLE_PART_LIST = "Lấy danh sách phụ tùng thành công";
    public static final String MESSAGE_SUCCESS_SHOWING_VEHICLE_PART_LIST_BY_VEHICLE_TYPE_ID = "Lấy danh sách phụ tùng theo id loại xe thành công";
    public static final String MESSAGE_SUCCESS_CREATING_VEHICLE_PART = "Tạo phụ tùng thành công";
    public static final String MESSAGE_SUCCESS_UPDATING_VEHICLE_PART = "Cập nhật phụ tùng thành công";
    public static final String MESSAGE_SUCCESS_DELETING_VEHICLE_PART = "Xóa phụ tùng thành công";
    public static final String MESSAGE_SUCCESS_RESTORING_VEHICLE_PART = "Khôi phục phụ tùng thành công";
    public static final String MESSAGE_SUCCESS_SHOWING_VEHICLE_PART_ENUM = "Lấy giá trị enum của phụ tùng thành công";

    // Failed message
    public static final String MESSAGE_ERR_VEHICLE_PART_NOT_FOUND = "Không tìm thấy phụ tùng";
    public static final String MESSAGE_ERR_VEHICLE_PART_LIST_NOT_FOUND = "Không tìm thấy danh sách phụ tùng";
    public static final String MESSAGE_ERR_DUPLICATED_VEHICLE_PART = "Phụ tùng này đã tồn tại";
    public static final String MESSAGE_ERR_CAN_NOT_DELETE_VEHICLE_PART = "Có cuộc hẹn cần sử dụng phụ tùng này";
    public static final String MESSAGE_ERR_QUANTITY_NOT_ENOUGH = "Số lượng phụ tùng không đủ để sử dụng";


    // Error Logs
    public static final String LOG_ERR_VEHICLE_PART_NOT_FOUND = "Không tìm thấy phụ tùng với id: {}";
    public static final String LOG_ERR_VEHICLE_PART_LIST_NOT_FOUND = "Không tìm thấy danh sách phụ tùng với id: {}";
    public static final String LOG_ERR_DUPLICATED_VEHICLE_PART = "Phụ tùng này đã tồn tại: {}";
    public static final String LOG_ERR_CAN_NOT_DELETE_VEHICLE_PART = "Có cuộc hẹn đang sử dụng phụ tùng này: {}";
    public static final String LOG_ERR_QUANTITY_NOT_ENOUGH = "Số lượng phụ tùng không đủ để sử dụng, số lượng còn lại: {} ";
    public static final String LOG_ERR_QUANTITY_ALMOST_OVERREACHED = "Số lượng phụ tùng sắp hết : {}";

    // Info Logs
    public static final String LOG_INFO_SHOWING_VEHICLE_PART = "Đang lấy phụ tùng với id: {}";
    public static final String LOG_INFO_SHOWING_VEHICLE_PART_LIST = "Đang lấy danh sách phụ tùng: {}";
    public static final String LOG_INFO_CREATING_VEHICLE_PART = "Đang tạo phụ tùng: {}";
    public static final String LOG_INFO_UPDATING_VEHICLE_PART = "Đang cập nhật phụ tùng: {}";
    public static final String LOG_INFO_DELETING_VEHICLE_PART = "Đang xóa phụ tùng: {}";
    public static final String LOG_INFO_RESTORING_VEHICLE_PART = "Đang khôi phục phụ tùng với id: {}";

    // Success Logs
    public static final String LOG_SUCCESS_SHOWING_VEHICLE_PART = "Lấy phụ tùng thành công: {}";
    public static final String LOG_SUCCESS_SHOWING_VEHICLE_PART_ENUM = "Lấy giá trị enum của phụ tùng thành công: {}";

    public static final String LOG_SUCCESS_SHOWING_VEHICLE_PART_LIST= "Lấy danh sách phụ tùng thành công: {}";
    public static final String LOG_SUCCESS_SHOWING_VEHICLE_PART_LIST_BY_VEHICLE_TYPE_ID = "Lấy danh sách phụ tùng theo id loại xe thành công: {}";
    public static final String LOG_SUCCESS_CREATING_VEHICLE_PART = "Tạo phụ tùng thành công: {}";
    public static final String LOG_SUCCESS_UPDATING_VEHICLE_PART = "Cập nhật phụ tùng thành công: {}";
    public static final String LOG_SUCCESS_DELETING_VEHICLE_PART = "Xóa phụ tùng thành công: {}";
    public static final String LOG_SUCCESS_RESTORING_VEHICLE_PART = "Khôi phục phụ tùng thành công: {}";

    // Endpoint
    public static final String BASE_URL = EndpointConstants.V1.API + "/vehicle-part";
    public static final String VEHICLE_PART_ENUM_LIST = "/enum/";
    public static final String VEHICLE_PART_LIST = "/";
    public static final String VEHICLE_PART_LIST_BY_VEHICLE_TYPE_ID = "/vehicle-type/{vehicle_type_id}";
    public static final String VEHICLE_PART = "/{id}";
    public static final String VEHICLE_PART_UPDATE = "/{id}";
    public static final String VEHICLE_PART_DELETE = "/{id}";
    public static final String VEHICLE_PART_RESTORE = "/restore/{id}";
    public static final String VEHICLE_PART_CREATION = "/";
}
