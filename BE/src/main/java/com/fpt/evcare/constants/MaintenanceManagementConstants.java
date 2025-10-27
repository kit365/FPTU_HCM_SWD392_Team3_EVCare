package com.fpt.evcare.constants;

public class MaintenanceManagementConstants {

    // ============================
    // ✅ Success messages
    // ============================
    public static final String MESSAGE_SUCCESS_SHOWING_MAINTENANCE_MANAGEMENT = "Lấy thông tin quản lý bảo dưỡng thành công";
    public static final String MESSAGE_SUCCESS_SHOWING_MAINTENANCE_MANAGEMENT_STATUS_LIST = "Lấy danh sách trạng thái quản lý bảo dưỡng thành công";
    public static final String MESSAGE_SUCCESS_SHOWING_MAINTENANCE_MANAGEMENT_LIST = "Lấy danh sách quản lý bảo dưỡng thành công";
    public static final String MESSAGE_SUCCESS_UPDATING_MAINTENANCE_MANAGEMENT_NOTES = "Cập nhật ghi chú quản lý bảo dưỡng thành công";
    public static final String MESSAGE_SUCCESS_UPDATING_MAINTENANCE_MANAGEMENT_STATUS = "Cập nhật trạng thái quản lý bảo dưỡng thành công";

    // ============================
    // ❌ Failed messages
    // ============================
    public static final String MESSAGE_ERR_MAINTENANCE_MANAGEMENT_NOT_FOUND = "Không tìm thấy quản lý bảo dưỡng";
    public static final String MESSAGE_ERR_CREATION_MAINTENANCE_MANAGEMENT_LIST_NOT_FOUND = "Danh sách khởi tạo thông tin của phiếu bảo dưỡng không được để trống";
    public static final String MESSAGE_ERR_MAINTENANCE_MANAGEMENT_LIST_NOT_FOUND = "Không tìm thấy danh sách quản lý bảo dưỡng";
    public static final String MESSAGE_ERR_INVALID_STATUS = "Trạng thái quản lý bảo dưỡng không hợp lệ";
    public static final String MESSAGE_ERR_MAINTENANCE_RECORD_LIST_NOT_EXISTED_ON_MAINTENANCE_MANAGEMENT= "Không có phụ tùng nào trong MaintenanceManagement với id: {}";
    public static final String MESSAGE_ERR_CURRENT_STATUS_IS_NOT_SUITABLE_FOR_COMPLETION = "Không thể chuyển trạng thái thành COMPLETED nếu hiện tại đang là PENDING";
    public static final String MESSAGE_ERR_CANCEL_INITIALIZING_MAINTENANCE_MANAGEMENT_FOR_THIS_SERVICE_BECAUSE_OF_PART_NOT_ENOUGH = "Bỏ qua việc tạo MaintenanceManagement cho dịch vụ cha vì kho không đủ phụ tùng.";
    public static final String MESSAGE_ERR_NOT_ALL_RECORDS_APPROVED_BY_USER = "Không thể chuyển trạng thái sang COMPLETED vì cần tất cả phiếu bảo dưỡng phải được đồng ý bời khách hàng";
    public static final String MESSAGE_ERR_INVALID_STATUS_TRANSITION = "Không thể chuyển từ trạng thái hiện tại sang trạng thái mới.";

    // ============================
    // ℹ️ Info logs
    // ============================
    public static final String LOG_INFO_SHOWING_MAINTENANCE_MANAGEMENT = "Đang lấy thông tin quản lý bảo dưỡng với id: {}";
    public static final String LOG_INFO_CREATING_MAINTENANCE_MANAGEMENT = "Đang tạo quản lý bảo dưỡng cho cuộc hẹn của: {}";
    public static final String LOG_INFO_UPDATING_MAINTENANCE_MANAGEMENT_TIME = "Đang cập nhật thời gian theo id quản lý bảo dưỡng: {}";
    public static final String LOG_INFO_SHOWING_STATUS = "Đang lấy danh sách trạng thái của quản lý bảo dưỡng: {}";
    public static final String LOG_INFO_UPDATION_TOTAL_COST = "Đang cập nhật tổng chi phí quản lý bảo dưỡng với id: {}";
    public static final String LOG_INFO_UPDATING_MAINTENANCE_MANAGEMENT_NOTES = "Đang cập nhật ghi chú của id quản lý bảo dưõng: {}";
    public static final String LOG_INFO_UPDATING_MAINTENANCE_MANAGEMENT_STATUS = "Đang cập nhật trạng thái quản lý bảo dưỡng: {}";


    // ============================
    // ⚠️ Error logs
    // ============================
    public static final String LOG_ERR_MAINTENANCE_MANAGEMENT_NOT_FOUND = "Không tìm thấy quản lý bảo dưỡng: {}";
    public static final String LOG_ERR_CREATION_MAINTENANCE_MANAGEMENT_LIST_NOT_FOUND = "Danh sách khởi tạo thông tin của phiếu bảo dưỡng không được để trống: {}";
    public static final String LOG_ERR_MAINTENANCE_MANAGEMENT_LIST_NOT_FOUND = "Không tìm thấy danh sách quản lý bảo dưỡng: {}";
    public static final String LOG_ERR_INVALID_STATUS = "Trạng thái quản lý bảo dưỡng không hợp lệ: {}";
    public static final String LOG_ERR_END_TIME_INVALID = "Thời gian kết thúc không được nhỏ hơn thời gian bắt đầu:{}";
    public static final String LOG_ERR_CURRENT_STATUS_IS_NOT_SUITABLE_FOR_COMPLETION = "Không thể chuyển trạng thái thành COMPLETED nếu hiện tại đang là PENDING: {}";
    public static final String LOG_ERR_CANCEL_INITIALIZING_MAINTENANCE_MANAGEMENT_FOR_THIS_SERVICE_BECAUSE_OF_PART_NOT_ENOUGH = "Bỏ qua việc tạo MaintenanceManagement cho dịch vụ cha [{}] vì kho không đủ phụ tùng.";
    public static final String LOG_ERR_NOT_ALL_RECORDS_APPROVED_BY_USER = "Không thể chuyển trạng thái sang COMPLETED vì cần tất cả phiếu bảo dưỡng phải được đồng ý bời khách hàng: {}";
    public static final String LOG_ERR_INVALID_STATUS_TRANSITION = "Cấm chuyển trạng thái không hợp lệ: từ %s sang %s";

    // ============================
    // ✅ Success logs
    // ============================
    public static final String LOG_SUCCESS_SHOWING_MAINTENANCE_MANAGEMENT = "Lấy thông tin quản lý bảo dưỡng thành công: {}";
    public static final String LOG_SUCCESS_SHOWING_MAINTENANCE_MANAGEMENT_STATUS_LIST = "Lấy danh sách trạng thái quản lý bảo dưỡng thành công: {}";
    public static final String LOG_SUCCESS_SHOWING_MAINTENANCE_MANAGEMENT_LIST_FOR_ADMIN = "Lấy danh sách quản lý bảo dưỡng cho quản lý thành công: {}";
    public static final String LOG_SUCCESS_SHOWING_MAINTENANCE_MANAGEMENT_LIST_FOR_TECHNICIAN = "Lấy danh sách quản lý bảo dưỡng cho kỹ thuật viên thành công: {}";
    public static final String LOG_SUCCESS_UPDATING_MAINTENANCE_MANAGEMENT_NOTES = "Cập nhật ghi chú quản lý bảo dưỡng thành công: {}";
    public static final String LOG_SUCCESS_UPDATING_MAINTENANCE_MANAGEMENT_STATUS = "Cập nhật trạng thái quản lý bảo dưỡng thành công: {}";
    public static final String LOG_SUCCESS_CREATION_MAINTENANCE_MANAGEMENT_BY_APPOINTMENT = "Đã tạo MaintenanceManagement cho dịch vụ cha [{}] thuộc cuộc hẹn [{}]";

    // ============================
    // 🌐 Endpoint constants
    // ============================
    public static final String BASE_URL = EndpointConstants.V1.API + "/maintenance-management";
    public static final String MAINTENANCE_MANAGEMENT = "/{id}/";
    public static final String MAINTENANCE_MANAGEMENT_STATUS = "/status/{id}/";
    public static final String MAINTENANCE_MANAGEMENT_STATUS_LIST = "/status-list/";
    public static final String MAINTENANCE_MANAGEMENT_SEARCH_FOR_ADMIN = "/admin/search/";
    public static final String MAINTENANCE_MANAGEMENT_SEARCH_FOR_TECHNICIAN= "/technician/search/{technician_id}/";
    public static final String MAINTENANCE_MANAGEMENT_UPDATE_NOTES = "/status/{id}";
}
