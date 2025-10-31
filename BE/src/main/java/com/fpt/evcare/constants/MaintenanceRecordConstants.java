package com.fpt.evcare.constants;

public class MaintenanceRecordConstants {

    // ============================
    // ✅ Success messages
    // ============================
    public static final String MESSAGE_SUCCESS_CREATING_MAINTENANCE_RECORD = "Tạo phiếu bảo dưỡng thành công";
    public static final String MESSAGE_SUCCESS_UPDATING_MAINTENANCE_RECORD = "Cập nhật phiếu bảo dưỡng thành công";
    public static final String MESSAGE_SUCCESS_DELETING_MAINTENANCE_RECORD = "Xóa phiếu bảo dưỡng thành công";

    // ============================
    // ❌ Failed messages
    // ============================
    public static final String MESSAGE_ERR_MAINTENANCE_RECORD_NOT_FOUND = "Không tìm thấy phiếu bảo dưỡng";
    public static final String MESSAGE_ERR_NO_MAINTENANCE_RECORD_FOUND_FOR_MANAGEMENT = "Không tìm thấy danh sách phiếu bảo dưỡng theo id quản lý bảo dưỡng";
    public static final String MESSAGE_ERR_CREATION_MAINTENANCE_RECORD_LIST_NOT_FOUND = "Không tìm thấy danh sách thông tin khởi tạo phiếu bảo dưỡng";
    public static final String MESSAGE_ERR_VEHICLE_PART_NOT_FOUND = "Không tìm thấy phụ tùng tương ứng";

    // ============================
    // ℹ️ Info logs
    // ============================
    public static final String LOG_INFO_SHOWING_MAINTENANCE_RECORD_LIST_BY_MAINTENANCE_MANAGEMENT_ID = "Đang lấy danh sách phiếu bảo dưỡng theo id quản lý bảo dưỡng: {}";
    public static final String LOG_INFO_CREATING_MAINTENANCE_RECORD_BY_APPOINTMENT = "Đang tạo phiếu bảo dưỡng cho dịch vụ: {}";
    public static final String LOG_INFO_CREATING_MAINTENANCE_RECORD = "Đang tạo phiếu bảo dưỡng với phụ tùng: {}";
    public static final String LOG_INFO_UPDATING_MAINTENANCE_RECORD = "Đang cập nhật phiếu bảo dưỡng: {}";
    public static final String LOG_INFO_DELETING_MAINTENANCE_RECORD = "Đang xóa phiếu bảo dưỡng: {}";
    public static final String LOG_SUCCESS_UPDATING_QUANTITY_FOR_EXISTED_MAINTENANCE_RECORD = "Đã cập nhật số lượng cho phiếu bảo dưỡng đã có sẵn cho phụ tùng: {}";
    public static final String LOG_INFO_UPDATE_EXISTING_PART_QUANTITY = "Đã cập nhật lại số lượng phụ tùng '{}' từ {} lên {} trong phiếu bảo dưỡng có ID: {}";

    // ============================
    // ⚠️ Error logs
    // ============================
    public static final String LOG_ERR_MAINTENANCE_RECORD_NOT_FOUND = "Không tìm thấy phiếu bảo dưỡng với id: {}";
    public static final String LOG_ERR_NO_MAINTENANCE_RECORD_FOUND_FOR_MANAGEMENT = "Không tìm thấy danh sách phiếu bảo dưỡng theo id quản lý bảo dưỡng: {}";
    public static final String LOG_ERR_CREATION_MAINTENANCE_RECORD_LIST_NOT_FOUND = "Không tìm thấy danh sách thông tin khởi tạo phiếu bảo dưỡng: {}";
    public static final String LOG_ERR_VEHICLE_PART_NOT_FOUND = "Không tìm thấy phụ tùng tương ứng: {}";

    // ============================
    // ✅ Success logs
    // ============================

    public static final String LOG_SUCCESS_CREATING_MAINTENANCE_RECORD = "Tạo phiếu bảo dưỡng thành công: {}";
    public static final String LOG_SUCCESS_UPDATING_MAINTENANCE_RECORD = "Cập nhật phiếu bảo dưỡng thành công: {}";
    public static final String LOG_SUCCESS_DELETING_MAINTENANCE_RECORD = "Xóa phiếu bảo dưỡng thành công: {}";

    // ============================
    // 🌐 Endpoint constants
    // ============================
    public static final String BASE_URL = EndpointConstants.V1.API + "/maintenance-record";
    public static final String MAINTENANCE_RECORD_UPDATE = "/{id}";
    public static final String MAINTENANCE_RECORD_DELETE = "/{id}";
    public static final String MAINTENANCE_RECORD_CREATION = "/{maintenance_management_id}";
}
