package com.fpt.evcare.constants;

public class AppointmentConstants {

    // Success message
    public static final String MESSAGE_SUCCESS_SHOWING_APPOINTMENT = "Lấy lịch hẹn thành công";
    public static final String MESSAGE_SUCCESS_SHOWING_APPOINTMENT_LIST = "Lấy danh sách lịch hẹn thành công";
    public static final String MESSAGE_SUCCESS_CREATING_APPOINTMENT = "Tạo lịch hẹn thành công";
    public static final String MESSAGE_SUCCESS_UPDATING_APPOINTMENT = "Cập nhật lịch hẹn thành công";
    public static final String MESSAGE_SUCCESS_DELETING_APPOINTMENT = "Xóa lịch hẹn thành công";
    public static final String MESSAGE_SUCCESS_RESTORING_APPOINTMENT = "Khôi phục lịch hẹn thành công";
    public static final String MESSAGE_SUCCESS_SHOWING_USER_APPOINTMENT = "Lấy thành công danh sách cuộc hẹn của người dùng";
    public static final String MESSAGE_SUCCESS_UPDATING_APPOINTMENT_STATUS = "Cập nhật trạng thái thành công";
    public static final String MESSAGE_SUCCESS_SHOWING_APPOINTMENT_STATUS_LIST = "Lấy danh sách trạng thái cuộc hẹn thành công";
    public static final String MESSAGE_SUCCESS_SHOWING_SERVICE_MODE_LIST = "Lấy danh sách chế độ dịch vụ cuộc hen thành công";

    // Failed message
    public static final String MESSAGE_ERR_APPOINTMENT_NOT_FOUND = "Không tìm thấy lịch hẹn";
    public static final String MESSAGE_ERR_APPOINTMENT_LIST_NOT_FOUND = "Không tìm thấy danh sách lịch hẹn";
    public static final String MESSAGE_ERR_SERVICE_MODE_ENUM_NOT_MATCH = "Hình thức dịch vụ không hợp lệ";
    public static final String MESSAGE_ERR_APPOINTMENT_STATUS_NOT_MATCH = "Trạng thái cuộc hẹn không hợp lệ";
    public static final String MESSAGE_ERR_USER_APPOINTMENT_NOT_FOUND = "Không tìm thấy danh sách cuộc hẹn của người dùng";
    public static final String MESSAGE_ERR_SERVICE_TYPE_IS_REQUIRED = "Vui lòng chọn loại dịch vụ cụ thể khi tạo cuộc hẹn";
    public static final String MESSAGE_ERR_SERVICE_TYPE_IS_NOT_MATCH_WITH_VEHICLE_TYPE = "Dịch vụ được chọn không tương thích với loại xe được chọn";

    //Info message

    // Error Logs
    public static final String LOG_ERR_APPOINTMENT_NOT_FOUND = "Không tìm thấy lịch hẹn với id: {}";
    public static final String LOG_ERR_APPOINTMENT_LIST_NOT_FOUND = "Không tìm thấy danh sách lịch hẹn: {}";
    public static final String LOG_ERR_SERVICE_MODE_ENUM_NOT_MATCH = "Hình thức dịch vụ không hợp lệ: {}";
    public static final String LOG_ERR_APPOINTMENT_STATUS_NOT_MATCH = "Trạng thái cuộc hẹn không hợp lệ: {}";
    public static final String LOG_ERR_USER_APPOINTMENT_NOT_FOUND = "Không tìm thấy danh sách cuộc hẹn của người dùng: {}";
    public static final String LOG_ERR_SERVICE_TYPE_IS_REQUIRED = "Vui lòng chọn loại dịch vụ cụ thể khi tạo cuộc hẹn: {}";
    public static final String LOG_ERR_SERVICE_TYPE_IS_NOT_MATCH_WITH_VEHICLE_TYPE = "Dịch vụ được chọn không tương thích với loại xe được chọn: {}";

    // Info Logs
    public static final String LOG_INFO_SHOWING_APPOINTMENT = "Đang lấy lịch hẹn với id: {}";
    public static final String LOG_INFO_SHOWING_APPOINTMENT_LIST = "Đang lấy danh sách lịch hẹn: {}";
    public static final String LOG_INFO_CREATING_APPOINTMENT = "Đang tạo lịch hẹn: {}";
    public static final String LOG_INFO_UPDATING_APPOINTMENT = "Đang cập nhật lịch hẹn: {}";
    public static final String LOG_INFO_DELETING_APPOINTMENT = "Đang xóa lịch hẹn: {}";
    public static final String LOG_INFO_RESTORING_APPOINTMENT = "Đang khôi phục lịch hẹn với id: {}";
    public static final String LOG_INFO_SHOWING_USER_APPOINTMENT = "Lấy thành công danh sách cuộc hẹn của người dùng: {}";
    public static final String LOG_INFO_CALCULATING_QUOTE_PRICE = "Đang tính giá tạm tính cho cuộc hẹn: {}";
    public static final String LOG_INFO_SHOWING_APPOINTMENT_STATUS_LIST = "Đang lấy danh sách trạng thái cuộc hen: {}";
    public static final String LOG_INFO_SHOWING_SERVICE_MODE_LIST = "Đang lấy danh sách chế độ dịch vụ cuộc hen: {}";

    // Success Logs
    public static final String LOG_SUCCESS_SHOWING_APPOINTMENT = "Lấy lịch hẹn thành công: {}";
    public static final String LOG_SUCCESS_SHOWING_APPOINTMENT_LIST = "Lấy danh sách lịch hẹn thành công: {}";
    public static final String LOG_SUCCESS_CREATING_APPOINTMENT = "Tạo lịch hẹn thành công: {}";
    public static final String LOG_SUCCESS_UPDATING_APPOINTMENT = "Cập nhật lịch hẹn thành công: {}";
    public static final String LOG_SUCCESS_DELETING_APPOINTMENT = "Xóa lịch hẹn thành công: {}";
    public static final String LOG_SUCCESS_RESTORING_APPOINTMENT = "Khôi phục lịch hẹn thành công: {}";
    public static final String LOG_SUCCESS_SHOWING_USER_APPOINTMENT = "Lấy thành công danh sách cuộc hẹn của người dùng: {}";
    public static final String LOG_SUCCESS_UPDATING_APPOINTMENT_STATUS = "Cập nhật trạng thái thành công: {}";
    public static final String LOG_SUCCESS_CALCULATING_QUOTE_PRICE = "Giá tạm tính được tính thành công: {}";
    public static final String LOG_SUCCESS_SHOWING_APPOINTMENT_STATUS_LIST = "Lấy danh sách trạng thái cuộc hẹn thành công: {}";
    public static final String LOG_SUCCESS_SHOWING_SERVICE_MODE_LIST = "Lấy danh sách chế độ dịch vụ cuộc hen thành công: {}";



    // Endpoint
    public static final String BASE_URL = EndpointConstants.V1.API + "/appointment";
    public static final String APPOINTMENT_LIST = "/";
    public static final String APPOINTMENT = "/{id}";
    public static final String APPOINTMENT_QUOTE_PRICE_CALCULATING = "/quote-price/{id}";
    public static final String APPOINTMENT_BY_USER_ID = "/user/{user-id}";
    public static final String APPOINTMENT_UPDATE = "/{id}";
    public static final String APPOINTMENT_STATUS_UPDATE = "/status/{id}";
    public static final String APPOINTMENT_STATUS = "/status/{id}";
    public static final String SERVICE_MODE = "/service-mode/{id}";
    public static final String APPOINTMENT_DELETE = "/{id}";
    public static final String APPOINTMENT_RESTORE = "/restore/{id}";
    public static final String APPOINTMENT_CREATION = "/";
}
