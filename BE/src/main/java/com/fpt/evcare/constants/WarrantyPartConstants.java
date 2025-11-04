package com.fpt.evcare.constants;

public class WarrantyPartConstants {

    // ============================
    // ✅ Success messages
    // ============================
    public static final String MESSAGE_SUCCESS_SHOWING_WARRANTY_PART = "Lấy bảo hành phụ tùng thành công";
    public static final String MESSAGE_SUCCESS_SHOWING_WARRANTY_PART_LIST = "Lấy danh sách bảo hành phụ tùng thành công";
    public static final String MESSAGE_SUCCESS_CREATING_WARRANTY_PART = "Tạo bảo hành phụ tùng thành công";
    public static final String MESSAGE_SUCCESS_UPDATING_WARRANTY_PART = "Cập nhật bảo hành phụ tùng thành công";
    public static final String MESSAGE_SUCCESS_DELETING_WARRANTY_PART = "Xóa bảo hành phụ tùng thành công";
    public static final String MESSAGE_SUCCESS_RESTORING_WARRANTY_PART = "Khôi phục bảo hành phụ tùng thành công";

    // ============================
    // ❌ Failed messages
    // ============================
    public static final String MESSAGE_ERR_WARRANTY_PART_NOT_FOUND = "Không tìm thấy bảo hành phụ tùng";
    public static final String MESSAGE_ERR_VEHICLE_PART_NOT_FOUND = "Không tìm thấy phụ tùng";
    public static final String MESSAGE_ERR_DUPLICATED_WARRANTY_PART = "Bảo hành cho phụ tùng này đã tồn tại";
    public static final String MESSAGE_ERR_INVALID_DISCOUNT_VALUE = "Giá trị giảm giá không hợp lệ (phải từ 0-100)";
    public static final String MESSAGE_ERR_DISCOUNT_VALUE_REQUIRED = "Giá trị giảm giá bắt buộc khi loại giảm giá là PERCENTAGE";
    public static final String MESSAGE_ERR_INVALID_VALIDITY_PERIOD = "Thời gian hiệu lực không hợp lệ (phải lớn hơn 0)";

    // ============================
    // ⚠️ Error logs
    // ============================
    public static final String LOG_ERR_WARRANTY_PART_NOT_FOUND = "Không tìm thấy bảo hành phụ tùng với id: {}";
    public static final String LOG_ERR_VEHICLE_PART_NOT_FOUND = "Không tìm thấy phụ tùng với id: {}";
    public static final String LOG_ERR_DUPLICATED_WARRANTY_PART = "Bảo hành cho phụ tùng này đã tồn tại: vehiclePartId={}";
    public static final String LOG_ERR_INVALID_DISCOUNT_VALUE = "Giá trị giảm giá không hợp lệ: {}";
    public static final String LOG_ERR_INVALID_VALIDITY_PERIOD = "Thời gian hiệu lực không hợp lệ: {}";

    // ============================
    // ℹ️ Info logs
    // ============================
    public static final String LOG_INFO_SHOWING_WARRANTY_PART = "Đang lấy bảo hành phụ tùng với id: {}";
    public static final String LOG_INFO_SHOWING_WARRANTY_PART_LIST = "Đang lấy danh sách bảo hành phụ tùng";
    public static final String LOG_INFO_CREATING_WARRANTY_PART = "Đang tạo bảo hành phụ tùng cho vehiclePartId: {}";
    public static final String LOG_INFO_UPDATING_WARRANTY_PART = "Đang cập nhật bảo hành phụ tùng: {}";
    public static final String LOG_INFO_DELETING_WARRANTY_PART = "Đang xóa bảo hành phụ tùng: {}";
    public static final String LOG_INFO_RESTORING_WARRANTY_PART = "Đang khôi phục bảo hành phụ tùng: {}";

    // ============================
    // ✅ Success logs
    // ============================
    public static final String LOG_SUCCESS_SHOWING_WARRANTY_PART = "Lấy bảo hành phụ tùng thành công: {}";
    public static final String LOG_SUCCESS_SHOWING_WARRANTY_PART_LIST = "Lấy danh sách bảo hành phụ tùng thành công";
    public static final String LOG_SUCCESS_CREATING_WARRANTY_PART = "Tạo bảo hành phụ tùng thành công: {}";
    public static final String LOG_SUCCESS_UPDATING_WARRANTY_PART = "Cập nhật bảo hành phụ tùng thành công: {}";
    public static final String LOG_SUCCESS_DELETING_WARRANTY_PART = "Xóa bảo hành phụ tùng thành công: {}";
    public static final String LOG_SUCCESS_RESTORING_WARRANTY_PART = "Khôi phục bảo hành phụ tùng thành công: {}";

    // ============================
    // 🌐 Endpoint constants
    // ============================
    public static final String BASE_URL = EndpointConstants.V1.API + "/warranty-part";
    public static final String WARRANTY_PART_LIST = "/";
    public static final String WARRANTY_PART_LIST_BY_VEHICLE_PART_ID = "/vehicle-part/{vehicle_part_id}";
    public static final String WARRANTY_PART = "/{id}";
    public static final String WARRANTY_PART_UPDATE = "/{id}";
    public static final String WARRANTY_PART_DELETE = "/{id}";
    public static final String WARRANTY_PART_RESTORE = "/restore/{id}";
    public static final String WARRANTY_PART_CREATION = "/";
    
    // Additional log messages
    public static final String LOG_INFO_NO_WARRANTY_PARTS_FOUND = "No warranty parts found - returning empty page";
}
