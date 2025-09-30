package com.fpt.evcare.constants;

public class VehiclePartCategoryConstant {

    //Sucess message
    public static final String MESSAGE_SUCCESS_SHOWING_VEHICLE_PART_CATEGORY = "Lấy danh mục phụ tùng dùng thành công";
    public static final String MESSAGE_SUCCESS_SHOWING_VEHICLE_PART_CATEGORY_LIST = "Lấy danh sách danh mục phụ tùng dùng thành công";
    public static final String MESSAGE_SUCCESS_CREATING_VEHICLE_PART_CATEGORY = "Tạo danh mục phụ tùng thành công";
    public static final String MESSAGE_SUCCESS_UPDATING_VEHICLE_PART_CATEGORY = "Cập nhật danh mục phụ tùng thành công";
    public static final String MESSAGE_SUCCESS_DELETING_VEHICLE_PART_CATEGORY = "Xóa danh mục phụ tùng thành công";

    //Failed message
    public static final String MESSAGE_ERR_VEHICLE_PART_CATEGORY_NOT_FOUND = "Không tìm thấy danh mục phụ tùng";
    public static final String MESSAGE_ERR_VEHICLE_PART_CATEGORY_LIST_NOT_FOUND = "Không tìm thấy danh sách danh mục phụ tùng";
    public static final String MESSAGE_ERR_DUPLICATED_VEHICLE_PART_CATEGORY = "Danh mục phụ tùng này đã tồn tại";

    //Log
    //Error Logs
    public static final String LOG_ERR_VEHICLE_PART_CATEGORY_NOT_FOUND = "Không tìm thấy danh mục phụ tùng";
    public static final String LOG_ERR_DUPLICATED_VEHICLE_PART_CATEGORY = "Danh mục phụ tùng này đã tồn tại: {}";

    //Success Logs
    public static final String LOG_INFO_SHOWING_VEHICLE_PART_CATEGORY = "Đang lấy danh mục phụ tùng với id: {}";
    public static final String LOG_INFO_SHOWING_VEHICLE_PART_CATEGORY_LIST = "Đang lấy danh sách danh mục phụ tùng";
    public static final String LOG_INFO_CREATING_VEHICLE_PART_CATEGORY = "Đang tạo danh mục phụ tùng: {}";
    public static final String LOG_INFO_UPDATING_VEHICLE_PART_CATEGORY = "Đang cập nhật danh mục phụ tùng: {}";
    public static final String LOG_INFO_DELETING_VEHICLE_PART_CATEGORY = "Đang xóa danh mục phụ tùng: {}";
    public static final String LOG_INFO_RESTORING_VEHICLE_PART_CATEGORY = "Đang khôi phục danh mục phụ tùng với từ khóa: {}";

    // Endpoint
    public static final String BASE_URL = EndpointConstants.V1.API + "/part-category";
    public static final String VEHICLE_PART_CATEGORY_LIST= "/";
    public static final String VEHICLE_PART_CATEGORY = "/{id}";
    public static final String VEHICLE_PART_CATEGORY_SEARCH = "/search";
    public static final String VEHICLE_PART_CATEGORY_UPDATE = "/{id}";
    public static final String VEHICLE_PART_CATEGORY_DELETE = "/{id}";
    public static final String VEHICLE_PART_CATEGORY_RESTORING = "/restore/{id}";
    public static final String VEHICLE_PART_CATEGORY_CREATION = "/";

}
