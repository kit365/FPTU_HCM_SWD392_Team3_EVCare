package com.fpt.evcare.constants;

public class WarrantyPackageConstants {

    // ============================
    // ✅ Success messages
    // ============================
    public static final String MESSAGE_SUCCESS_SHOWING_WARRANTY_PACKAGE = "Lấy gói bảo hành thành công";
    public static final String MESSAGE_SUCCESS_SHOWING_WARRANTY_PACKAGE_LIST = "Lấy danh sách gói bảo hành thành công";
    public static final String MESSAGE_SUCCESS_CREATING_WARRANTY_PACKAGE = "Tạo gói bảo hành thành công";
    public static final String MESSAGE_SUCCESS_UPDATING_WARRANTY_PACKAGE = "Cập nhật gói bảo hành thành công";
    public static final String MESSAGE_SUCCESS_DELETING_WARRANTY_PACKAGE = "Xóa gói bảo hành thành công";
    public static final String MESSAGE_SUCCESS_SHOWING_WARRANTY_PACKAGE_PART = "Lấy phụ tùng bảo hành thành công";
    public static final String MESSAGE_SUCCESS_SHOWING_WARRANTY_PACKAGE_PART_LIST = "Lấy danh sách phụ tùng bảo hành thành công";
    public static final String MESSAGE_SUCCESS_CREATING_WARRANTY_PACKAGE_PART = "Tạo phụ tùng bảo hành thành công";
    public static final String MESSAGE_SUCCESS_UPDATING_WARRANTY_PACKAGE_PART = "Cập nhật phụ tùng bảo hành thành công";
    public static final String MESSAGE_SUCCESS_DELETING_WARRANTY_PACKAGE_PART = "Xóa phụ tùng bảo hành thành công";

    // ============================
    // ❌ Failed messages
    // ============================
    public static final String MESSAGE_ERR_WARRANTY_PACKAGE_NOT_FOUND = "Không tìm thấy gói bảo hành";
    public static final String MESSAGE_ERR_WARRANTY_PACKAGE_LIST_NOT_FOUND = "Không tìm thấy danh sách gói bảo hành";
    public static final String MESSAGE_ERR_DUPLICATED_WARRANTY_PACKAGE = "Gói bảo hành này đã tồn tại";
    public static final String MESSAGE_ERR_WARRANTY_PACKAGE_PART_NOT_FOUND = "Không tìm thấy phụ tùng bảo hành";
    public static final String MESSAGE_ERR_INVALID_WARRANTY_DATE_RANGE = "Khoảng thời gian bảo hành không hợp lệ";
    public static final String MESSAGE_ERR_WARRANTY_EXPIRED = "Gói bảo hành đã hết hạn";

    // ============================
    // ⚠️ Error logs
    // ============================
    public static final String LOG_ERR_WARRANTY_PACKAGE_NOT_FOUND = "Không tìm thấy gói bảo hành với id: {}";
    public static final String LOG_ERR_WARRANTY_PACKAGE_LIST_NOT_FOUND = "Không tìm thấy danh sách gói bảo hành: {}";
    public static final String LOG_ERR_DUPLICATED_WARRANTY_PACKAGE = "Gói bảo hành này đã tồn tại: {}";
    public static final String LOG_ERR_WARRANTY_PACKAGE_PART_NOT_FOUND = "Không tìm thấy phụ tùng bảo hành với id: {}";
    public static final String LOG_ERR_INVALID_WARRANTY_DATE_RANGE = "Khoảng thời gian bảo hành không hợp lệ: {}";

    // ============================
    // ℹ️ Info logs
    // ============================
    public static final String LOG_INFO_SHOWING_WARRANTY_PACKAGE = "Đang lấy gói bảo hành với id: {}";
    public static final String LOG_INFO_SHOWING_WARRANTY_PACKAGE_LIST = "Đang lấy danh sách gói bảo hành";
    public static final String LOG_INFO_CREATING_WARRANTY_PACKAGE = "Đang tạo gói bảo hành: {}";
    public static final String LOG_INFO_UPDATING_WARRANTY_PACKAGE = "Đang cập nhật gói bảo hành: {}";
    public static final String LOG_INFO_DELETING_WARRANTY_PACKAGE = "Đang xóa gói bảo hành: {}";
    public static final String LOG_INFO_CHECKING_WARRANTY_VALIDITY = "Đang kiểm tra hiệu lực bảo hành cho phụ tùng: {}";

    // ============================
    // ✅ Success logs
    // ============================
    public static final String LOG_SUCCESS_SHOWING_WARRANTY_PACKAGE = "Lấy gói bảo hành thành công: {}";
    public static final String LOG_SUCCESS_SHOWING_WARRANTY_PACKAGE_LIST = "Lấy danh sách gói bảo hành thành công";
    public static final String LOG_SUCCESS_CREATING_WARRANTY_PACKAGE = "Tạo gói bảo hành thành công: {}";
    public static final String LOG_SUCCESS_UPDATING_WARRANTY_PACKAGE = "Cập nhật gói bảo hành thành công: {}";
    public static final String LOG_SUCCESS_DELETING_WARRANTY_PACKAGE = "Xóa gói bảo hành thành công: {}";

    // ============================
    // 🌐 Endpoint constants
    // ============================
    public static final String BASE_URL = EndpointConstants.V1.API + "/warranty-package";
    public static final String WARRANTY_PACKAGE_LIST = "/";
    public static final String WARRANTY_PACKAGE = "/{id}";
    public static final String WARRANTY_PACKAGE_UPDATE = "/{id}";
    public static final String WARRANTY_PACKAGE_DELETE = "/{id}";
    public static final String WARRANTY_PACKAGE_CREATION = "/";
    public static final String WARRANTY_PACKAGE_PART_LIST = "/{warrantyPackageId}/parts";
    public static final String WARRANTY_PACKAGE_PART = "/parts/{id}";
    public static final String WARRANTY_PACKAGE_PART_CREATION = "/{warrantyPackageId}/parts";
    public static final String WARRANTY_PACKAGE_PART_UPDATE = "/parts/{id}";
    public static final String WARRANTY_PACKAGE_PART_DELETE = "/parts/{id}";
}

