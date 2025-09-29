package com.fpt.evcare.constants;

public class ServiceTypeConstants {

    //Sucess message
    public static final String MESSAGE_SUCCESS_SHOWING_SERVICE_TYPE = "Lấy dịch vụ thành công";
    public static final String MESSAGE_SUCCESS_SHOWING_SERVICE_TYPE_LIST = "Lấy danh sách dịch vụ thành công";
    public static final String MESSAGE_SUCCESS_CREATING_SERVICE_TYPE = "Tạo dịch vụ thành công";
    public static final String MESSAGE_SUCCESS_UPDATING_SERVICE_TYPE = "Cập nhật dịch vụ thành công";
    public static final String MESSAGE_SUCCESS_DELETING_SERVICE_TYPE = "Xóa dịch vụ thành công";

    //Failed message
    public static final String MESSAGE_ERR_PARENT_SERVICE_TYPE_NOT_FOUND = "Không tìm thấy dịch vụ cha";
    public static final String MESSAGE_ERR_SERVICE_TYPE_NOT_FOUND = "Không tìm thấy dịch vụ";
    public static final String MESSAGE_ERR_PARENT_SERVICE_TYPE_DELETED = "dịch vụ cha đã bị xóa";
    public static final String MESSAGE_ERR_CYCLE_IN_SERVICE_TYPE_HIERARCHY = "Phát hiện vòng lặp trong cấu trúc dịch vụ";
    public static final String MESSAGE_ERR_DUPLICATED_SERVICE_TYPE = "Loại dịch vụ này đã tồn tại";


    //Log message
    public static final String BASE_URL = EndpointConstants.V1.API + "/service-type";
    public static final String SERVICE_TYPE_LIST= "/";
    public static final String SERVICE_TYPE = "/{id}";
    public static final String SERVICE_TYPE_UPDATE = "/{id}";
    public static final String SERVICE_TYPE_DELETE = "/{id}";
    public static final String SERVICE_TYPE_CREATION = "/";
}
