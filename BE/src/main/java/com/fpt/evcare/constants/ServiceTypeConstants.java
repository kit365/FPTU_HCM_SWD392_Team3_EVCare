package com.fpt.evcare.constants;

public class ServiceTypeConstants {

    //Pageable Enum Value
    public static final String DEFAULT_PAGE_SIZE = "10";
    public static final String DEFAULT_PAGE_NUMBER = "0";

    //Sucess message
    public static final String MESSAGE_SUCCESS_SHOWING_SERVICE_TYPE = "Lấy dịch vụ thành công";
    public static final String MESSAGE_SUCCESS_SHOWING_PARENT_SERVICE_TYPE_LIST = "Lấy danh sách dịch vụ cha thành công";
    public static final String MESSAGE_SUCCESS_SHOWING_CHILDREN_SERVICE_TYPE_LIST = "Lấy danh sách dịch vụ con theo cha thành công";
    public static final String MESSAGE_SUCCESS_SHOWING_SERVICE_TYPE_LIST = "Lấy danh sách dịch vụ thành công";
    public static final String MESSAGE_SUCCESS_CREATING_SERVICE_TYPE = "Tạo dịch vụ thành công";
    public static final String MESSAGE_SUCCESS_UPDATING_SERVICE_TYPE = "Cập nhật dịch vụ thành công";
    public static final String MESSAGE_SUCCESS_DELETING_SERVICE_TYPE = "Xóa dịch vụ thành công";
    public static final String MESSAGE_SUCCESS_RESTORING_SERVICE_TYPE = "Khôi phục dịch vụ thành công";

    //Failed message
    public static final String MESSAGE_ERR_PARENT_SERVICE_TYPE_NOT_FOUND = "Không tìm thấy dịch vụ cha";
    public static final String MESSAGE_ERR_SERVICE_TYPE_NOT_FOUND = "Không tìm thấy dịch vụ";
    public static final String MESSAGE_ERR_SERVICE_TYPE_FOR_VEHICLE_TYPE_NOT_FOUND = "Không tìm thấy loại dịch vụ cho id loại xe";
    public static final String MESSAGE_ERR_PARENT_SERVICE_TYPE_DELETED = "dịch vụ cha đã bị xóa";
    public static final String MESSAGE_ERR_CYCLE_IN_SERVICE_TYPE_HIERARCHY = "Phát hiện vòng lặp trong cấu trúc dịch vụ";
    public static final String MESSAGE_ERR_DUPLICATED_SERVICE_TYPE = "Loại dịch vụ này đã tồn tại";
    public static final String MESSAGE_ERR_CAN_NOT_DELETE_SERVICE_TYPE = "Có cuộc hẹn đang sử dụng loại dịch vụ này";
    public static final String MESSAGE_ERR_MUST_CHOOSING_SPECIFIC_SERVICE_TYPE = "Vui lòng chọn loại dịch vụ cụ thể";
    public static final String MESSAGE_ERR_SERVICE_TYPE_IS_USED_ON_APPOINTMENT = "Loại dịch vụ này được sử dụng trong cuộc hẹn: {}";
    public static final String MESSAGE_ERR_SERVICE_TYPE_LIST_NOT_FOUND_BY_VEHICLE_TYPE_ID = "Không tìm thấy danh sách dịch vụ theo id loại xe";
    public static final String MESSAGE_ERR_CHILDREN_SERVICE_TYPE_LIST_NOT_FOUND_BY_VEHICLE_TYPE_ID_AND_PARENT_ID = "Không tìm thấy danh sách dịch vụ con theo loại xe và dịch vụ cha";
    public static final String MESSAGE_ERR_VEHICLE_TYPE_DOES_NOT_MATCH_BETWEEN_BOTH_SERVICES = "Loại xe của dịch vụ con không ứng với của dịch vụ cha";

    //Log message

    //Error Logs
    public static final String LOG_ERR_PARENT_SERVICE_TYPE_NOT_FOUND = "Không tìm thấy dịch vụ cha: {}";
    public static final String LOG_ERR_MUST_CHOOSING_SPECIFIC_SERVICE_TYPE = "Vui lòng chọn loại dịch vụ cụ thể: {}";
    public static final String LOG_ERR_SERVICE_TYPE_IS_USED_ON_APPOINTMENT = "Loại dịch vụ này được sử dụng trong cuộc hẹn: {}";
    public static final String LOG_ERR_SERVICE_TYPE_LIST_NOT_FOUND_BY_VEHICLE_TYPE_ID = "Không tìm thấy danh sách dịch vụ theo id loại xe: {}";
    public static final String LOG_ERR_CHILDREN_SERVICE_TYPE_LIST_NOT_FOUND_BY_VEHICLE_TYPE_ID_AND_PARENT_ID = "Không tìm thấy danh sách dịch vụ con theo id loại xe: {} và dịch vụ cha: {}";
    public static final String LOG_ERR_PART_NOT_ENOUGH_FOR_USING_IN_SERVICE = "Không đủ phụ tùng [{}] trong kho cho dịch vụ [{}]. Cần {}, còn {}";
    public static final String LOG_ERR_SERVICE_TYPE_NOT_FOUND = "Không tìm thấy loại dịch vụ: {}";
    public static final String LOG_ERR_VEHICLE_TYPE_DOES_NOT_MATCH_BETWEEN_BOTH_SERVICES = "Loại xe của dịch vụ con không ứng với của dịch vụ cha: {}";
    public static final String LOG_ERR_SERVICE_TYPE_FOR_VEHICLE_TYPE_NOT_FOUND = "Không tìm thấy loại dịch vụ cho id loại xe: {}";
    public static final String LOG_ERR_PARENT_SERVICE_TYPE_IS_DELETED = "Loại dịch vụ cha đã bị xóa: {}";
    public static final String LOG_ERR_CYCLE_IN_SERVICE_TYPE_HIERARCHY = "Phát hiện vòng lặp trong cấu trúc dịch vụ: {}";
    public static final String LOG_ERR_DUPLICATED_SERVICE_TYPE  = "Loại dịch vụ này đã tồn tại: {}";
    public static final String LOG_ERR_CAN_NOT_DELETE_SERVICE_TYPE = "Có cuộc hẹn đang sử dụng loại dịch vụ này: {}";


    //Success Logs
    public static final String LOG_INFO_SHOWING_SERVICE_TYPE = "Đang lấy loại dịch vụ với id: {}";
    public static final String LOG_INFO_SHOWING_SERVICE_TYPE_LIST_BY_VEHICLE_TYPE_FOR_APPOINTMENT = "Đang lấy danh sách loại dịch vụ trong cuộc hẹn theo id loại xe: {}";
    public static final String LOG_INFO_SHOWING_SERVICE_TYPE_LIST_BY_VEHICLE_TYPE = "Đang lấy danh sách loại dịch vụ theo id loại xe: {}";
    public static final String LOG_INFO_CREATING_SERVICE_TYPE = "Đang tạo loại dịch vụ: {}";
    public static final String LOG_INFO_UPDATING_SERVICE_TYPE = "Đang cập nhật loại dịch vụ: {}";
    public static final String LOG_INFO_DELETING_SERVICE_TYPE = "Đang xóa loại dịch vụ: {}";
    public static final String LOG_INFO_RESTORING_SERVICE_TYPE = "Đang khôi phục loại dịch vụ với từ khóa: {}";
    public static final String LOG_INFO_RESTORING_CHILD_SERVICE_TYPE = "Đang khôi phục dịch vụ con: {}";
    public static final String LOG_INFO_RESTORING_PARENT_SERVICE_TYPE = "Đang khôi phục dịch vụ cha: {}";

    //Endpoint
    public static final String BASE_URL = EndpointConstants.V1.API + "/service-type";
    public static final String SERVICE_TYPE_LIST= "/vehicle_type/{vehicleTypeId}";
    public static final String PARENT_SERVICE_TYPE_LIST_BY_VEHICLE_TYPE_ID= "/parent-services/service-type/{vehicleTypeId}";
    public static final String SERVICE_TYPE_LIST_BY_PARENT_ID_AND_VEHICLE_TYPE_ID= "/parent-services/{serviceTypeId}/vehicle-types/{vehicleTypeId}/service-types/";

    public static final String SERVICE_TYPE_LIST_FOR_APPOINTMENT= "/appointment/service-type/{serviceTypeId}";
    public static final String SERVICE_TYPE = "/{id}";
    public static final String SERVICE_TYPE_UPDATE = "/{id}";

    public static final String SERVICE_TYPE_DELETE = "/{id}";
    public static final String RESTORING_SERVICE_TYPE = "/restore/{id}";
    public static final String SERVICE_TYPE_CREATION = "/";
}
