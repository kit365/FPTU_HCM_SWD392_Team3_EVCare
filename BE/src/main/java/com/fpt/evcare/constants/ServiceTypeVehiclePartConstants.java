package com.fpt.evcare.constants;

public class ServiceTypeVehiclePartConstants {

    //Success messages
    public static final String MESSAGE_SUCCESS_SHOWING_SERVICE_TYPE_VEHICLE_PART = "Lấy thông tin loại dịch vụ - phụ tùng thành công";
    public static final String MESSAGE_SUCCESS_CREATING_SERVICE_TYPE_VEHICLE_PART = "Tạo loại dịch vụ - phụ tùng thành công";
    public static final String MESSAGE_SUCCESS_UPDATING_SERVICE_TYPE_VEHICLE_PART = "Cập nhật loại dịch vụ - phụ tùng thành công";
    public static final String MESSAGE_SUCCESS_DELETING_SERVICE_TYPE_VEHICLE_PART = "Xóa loại dịch vụ - phụ tùng thành công";
    public static final String MESSAGE_SUCCESS_RESTORING_SERVICE_TYPE_VEHICLE_PART = "Khôi phục loại dịch vụ - phụ tùng thành công";

    //Failed messages
    public static final String MESSAGE_ERR_SERVICE_TYPE_VEHICLE_PART_NOT_FOUND = "Không tìm thấy loại dịch vụ - phụ tùng";
    public static final String MESSAGE_ERR_APPOINTMENT_IS_USING_THIS_STVP = "Đang có cuộc hẹn sử dụng loại dịch vụ - phụ tùng này";
    public static final String MESSAGE_ERR_CHOSEN_VEHICLE_PART_NOT_SUITABLE = "Phụ tùng được chọn không phù hợp với dịch vụ cho loại xe này";

    //Log messages

    // --- Error Logs ---
    public static final String LOG_ERR_SERVICE_TYPE_VEHICLE_PART_NOT_FOUND = "Không tìm thấy loại dịch vụ - phụ tùng: {}";
    public static final String LOG_ERR_APPOINTMENT_IS_USING_THIS_STVP = "Đang có cuộc hẹn sử dụng loại dịch vụ - phụ tùng này: {}";
    public static final String LOG_ERR_CHOSEN_VEHICLE_PART_NOT_SUITABLE = "Phụ tùng được chọn không phù hợp với dịch vụ cho loại xe này: {}";

    // --- Info Logs ---
    public static final String LOG_INFO_SHOWING_SERVICE_TYPE_VEHICLE_PART = "Đang lấy loại dịch vụ - phụ tùng với id: {}";
    public static final String LOG_INFO_SHOWING_SERVICE_TYPE_VEHICLE_PART_LIST_BY_SERVICE_TYPE_ID = "Đang lấy danh sách loại dịch vụ - phụ tùng theo id service type: {}";
    public static final String LOG_INFO_CREATING_SERVICE_TYPE_VEHICLE_PART = "Đang tạo loại dịch vụ - phụ tùng: {}";
    public static final String LOG_INFO_UPDATING_SERVICE_TYPE_VEHICLE_PART = "Đang cập nhật loại dịch vụ - phụ tùng: {}";
    public static final String LOG_INFO_DELETING_SERVICE_TYPE_VEHICLE_PART = "Đang xóa loại dịch vụ - phụ tùng: {}";
    public static final String LOG_INFO_RESTORING_SERVICE_TYPE_VEHICLE_PART = "Đang khôi phục loại dịch vụ - phụ tùng: {}";


    // -- Success Logs ---
    public static final String LOG_SUCCESS_UPDATING_SERVICE_TYPE_VEHICLE_PART = "Cập nhật loại dịch vụ - phụ tùng thành công: {}";
    public static final String LOG_SUCCESS_SHOWING_SERVICE_TYPE_VEHICLE_PART = "Lấy loại dịch vụ - phụ tùng thành công: {}";
    public static final String LOG_SUCCESS_CREATING_SERVICE_TYPE_VEHICLE_PART = "Tạo loại dịch vụ - phụ tùng thành công: {}";
    public static final String LOG_SUCCESS_DELETING_SERVICE_TYPE_VEHICLE_PART = "Xóa loại dịch vụ - phụ t ùng thành công: {}";
    public static final String LOG_SUCCESS_RESTORING_SERVICE_TYPE_VEHICLE_PART = "Khôi phục loại dịch vụ - phụ tùng thành công: {}";

    //Base URL
    public static final String BASE_URL = EndpointConstants.V1.API + "/service-type/vehicle-part";
    public static final String STVP = "/{id}";
    public static final String STVP_UPDATE = "/{id}";
    public static final String STVP_DELETE = "/{id}";
    public static final String STVP_RESTORE = "/restore/{id}";
    public static final String STVP_CREATION = "/";

}

