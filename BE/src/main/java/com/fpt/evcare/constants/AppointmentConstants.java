package com.fpt.evcare.constants;

public class AppointmentConstants {
    //Info message

    // Success message
    public static final String MESSAGE_SUCCESS_SHOWING_APPOINTMENT = "Lấy lịch hẹn thành công";
    public static final String MESSAGE_SUCCESS_SHOWING_APPOINTMENT_LIST = "Lấy danh sách lịch hẹn thành công";
    public static final String MESSAGE_SUCCESS_CREATING_APPOINTMENT = "Tạo lịch hẹn thành công";
    public static final String MESSAGE_SUCCESS_SHOWING_USER_APPOINTMENT = "Lấy thành công danh sách cuộc hẹn của người dùng";
    public static final String MESSAGE_SUCCESS_SHOWING_APPOINTMENT_CANCELLED_STATUS = "Lấy trạng thái CANCELLED của cuộc hẹn thành công";
    public static final String MESSAGE_SUCCESS_SHOWING_SERVICE_MODE_LIST = "Lấy danh sách chế độ dịch vụ cuộc hen thành công";
    public static final String MESSAGE_SUCCESS_UPDATING_APPOINTMENT_CUSTOMER = "Cập nhật lịch hẹn thành công cho người dùng";
    public static final String MESSAGE_SUCCESS_UPDATING_APPOINTMENT_ADMIN = "Cập nhật lịch hẹn thành công cho admin";
    public static final String MESSAGE_SUCCESS_UPDATING_APPOINTMENT_STATUS = "Cập nhật trạng thái lịch hẹn thành công cho admin";
    public static final String MESSAGE_SUCCESS_SHOWING_SEARCH_APPOINTMENT_FOR_CUSTOMER = "Tra cứu thông tin cuộc hẹn của khách hàng thành công";
    public static final String MESSAGE_SUCCESS_SHOWING_APPOINTMENT_IN_PROGRESS_STATUS = "Lấy trạng thái IN_PROGRESS của cuộc hẹn thành công";
    public static final String MESSAGE_ERR_CAN_NOT_TRANSFER_FROM_IN_PROGRESS_TO_PENDING = "Không thể chuyển trạng thái từ IN_PROGRESS về lại PENDING";
    public static final String LOG_INFO_APPOINTMENT_STATUS_AUTO_COMPLETED = "Cuộc hẹn có ID [{}] đã được tự động chuyển sang trạng thái COMPLETED (trạng thái trước đó: {}).";
    public static final String LOG_WARN_APPOINTMENT_NOT_IN_PROGRESS_FOR_COMPLETION = "Cuộc hẹn có ID [{}] không thể tự động chuyển sang COMPLETED vì trạng thái hiện tại là {}.";

    // Failed message
    public static final String MESSAGE_ERR_APPOINTMENT_NOT_FOUND = "Không tìm thấy lịch hẹn";
    public static final String MESSAGE_ERR_TECHNICIAN_NOT_FOUND = "Không tìm thấy kỹ thuật viên này";
    public static final String MESSAGE_ERR_ASSIGNEE_NOT_FOUND = "Không tìm thấy người phân công";
    public static final String MESSAGE_ERR_CANNOT_CANCEL_APPOINTMENT_HAS_IN_PROGRESS_MAINTENANCE_MANAGEMENT = "Không thể hủy cuộc hẹn vì có quản lý bảo dưỡng đang được tiến hành";
    public static final String MESSAGE_ERR_APPOINTMENT_LIST_NOT_FOUND = "Không tìm thấy danh sách lịch hẹn";
    public static final String MESSAGE_ERR_SERVICE_MODE_ENUM_NOT_MATCH = "Hình thức dịch vụ không hợp lệ";
    public static final String MESSAGE_ERR_APPOINTMENT_STATUS_NOT_MATCH = "Trạng thái cuộc hẹn không hợp lệ";
    public static final String MESSAGE_ERR_USER_APPOINTMENT_NOT_FOUND = "Không tìm thấy danh sách cuộc hẹn của người dùng";
    public static final String MESSAGE_ERR_SERVICE_TYPE_IS_REQUIRED = "Vui lòng chọn loại dịch vụ cụ thể khi tạo cuộc hẹn";
    public static final String MESSAGE_ERR_SERVICE_TYPE_IS_NOT_MATCH_WITH_VEHICLE_TYPE = "Dịch vụ được chọn không tương thích với loại xe được chọn";
    public static final String MESSAGE_ERR_USER_ADDRESS_MUST_BE_ADDED_IF_MOBILE_STATUS_APPEARED = "Người dùng cần thêm địa chỉ khi chọn dịch vụ bảo dưỡng lưu động";
    public static final String MESSAGE_ERR_CAN_NOT_UPDATE_CUSTOMER_INFO_IN_IN_PROGRESS_APPOINTMENT_STATUS = "Không thể cập nhật thông tin cuộc hẹn khi đang trong quá trình sửa chữa";
    public static final String MESSAGE_ERR_APPOINTMENT_ALREADY_COMPLETED_OR_CANCELLED = "Không thể thay đổi trạng thái vì cuộc hẹn đã hoàn tất hoặc bị huỷ.";
    public static final String MESSAGE_ERR_APPOINTMENT_CANNOT_CANCEL_HAS_MAINTENANCE = "Không thể huỷ vì cuộc hẹn đã có dữ liệu bảo trì.";
    public static final String MESSAGE_ERR_APPOINTMENT_INVALID_STATUS_TRANSITION_TO_IN_PROGRESS = "Chỉ có thể chuyển sang IN_PROGRESS khi cuộc hẹn đang ở PENDING.";
    public static final String MESSAGE_SUCCESS_SHOWING_SEARCH_APPOINTMENT_FOR_GUEST = "Tra cứu thông tin cuộc hẹn của khách vãng lai thành công";
    public static final String MESSAGE_ERR_THIS_APPOINTMENT_IS_NOT_ASSIGNED = "Không thể chuyển trạng thái cuộc hẹn khi chưa được phân công";
    public static final String MESSAGE_ERR_CANNOT_CHANGE_COMPLETED_STATUS_WHILE_MAINTENANCE_MANAGEMENT_IN_PROGRESS = "Cuộc hẹn chỉ được hoàn thành khi các quản lý bảo dưỡng của cuộc hẹn đó hoàn thành";

    // Error Logs
    public static final String LOG_ERR_APPOINTMENT_NOT_FOUND = "Không tìm thấy lịch hẹn với id: {}";
    public static final String LOG_ERR_TECHNICIAN_NOT_FOUND = "Không tìm thấy kỹ thuật viên này: {}";
    public static final String LOG_ERR_ASSIGNEE_NOT_FOUND = "Không tìm thấy người phân công: {}";
    public static final String LOG_ERR_CANNOT_CANCEL_APPOINTMENT_HAS_IN_PROGRESS_MAINTENANCE_MANAGEMENT = "Không thể hủy cuộc hẹn vì có quản lý bảo dưỡng đang được tiến hành: {}";
    public static final String LOG_ERR_APPOINTMENT_LIST_NOT_FOUND = "Không tìm thấy danh sách lịch hẹn: {}";
    public static final String LOG_ERR_SERVICE_MODE_ENUM_NOT_MATCH = "Hình thức dịch vụ không hợp lệ: {}";
    public static final String LOG_ERR_APPOINTMENT_STATUS_NOT_MATCH = "Trạng thái cuộc hẹn không hợp lệ: {}";
    public static final String LOG_ERR_USER_APPOINTMENT_NOT_FOUND = "Không tìm thấy danh sách cuộc hẹn của người dùng: {}";
    public static final String LOG_ERR_SERVICE_TYPE_IS_REQUIRED = "Vui lòng chọn loại dịch vụ cụ thể khi tạo cuộc hẹn: {}";
    public static final String LOG_ERR_SERVICE_TYPE_IS_NOT_MATCH_WITH_VEHICLE_TYPE = "Dịch vụ được chọn không tương thích với loại xe được chọn: {}";
    public static final String LOG_ERR_USER_ADDRESS_MUST_BE_ADDED_IF_MOBILE_STATUS_APPEARED = "Người dùng cần thêm địa chỉ khi chọn dịch vụ bảo dưỡng lưu động: {}";
    public static final String LOG_ERR_CAN_NOT_UPDATE_CUSTOMER_INFO_IN_IN_PROGRESS_APPOINTMENT_STATUS = "Không thể cập nhật thông tin cuộc hẹn khi đang trong quá trình sửa chữa: {}";
    public static final String LOG_ERR_THIS_APPOINTMENT_IS_NOT_ASSIGNED = "Không thể chuyển trạng thái cuộc hẹn khi chưa được phân công: {}";
    public static final String LOG_ERR_CAN_NOT_TRANSFER_FROM_IN_PROGRESS_TO_PENDING = "Không thể chuyển trạng thái từ IN_PROGRESS về lại PENDING: {}";
    public static final String LOG_ERR_THIS_APPOINTMENT_IS_ALREADY_HAS_MAINTENANCE_MANAGEMENT = "Cuộc hẹn [{}] đã có Maintenance Management, bỏ qua việc tạo mới...";
    public static final String LOG_ERR_SERVICES_ARE_NOT_FOUND_IN_THIS_APPOINTMENT = "Cuộc hẹn [{}] không có dịch vụ nào để tạo Maintenance Management";
    public static final String LOG_ERR_SCHEDULE_TIME_NOT_BLANK = "Ngày hẹn không được để trống.";
    public static final String LOG_ERR_SCHEDULE_TIME_NOT_LESS_THAN_NOW = "Không thể chọn ngày hẹn nhỏ hơn thời điểm hiện tại.";
    public static final String LOG_ERR_APPOINTMENT_ALREADY_FINALIZED = "Cuộc hẹn đã ở trạng thái {}. Không thể thay đổi thêm.";
    public static final String LOG_ERR_APPOINTMENT_INVALID_TRANSITION_TO_IN_PROGRESS = "Không thể chuyển sang IN_PROGRESS vì trạng thái hiện tại không phải là PENDING.";
    public static final String LOG_ERR_APPOINTMENT_CANNOT_CANCEL_HAS_MAINTENANCE = "Không thể huỷ cuộc hẹn {} vì đã có dữ liệu bảo trì.";
    public static final String LOG_ERR_CANNOT_CHANGE_COMPLETED_STATUS_WHILE_MAINTENANCE_MANAGEMENT_IN_PROGRESS = "Cuộc hẹn chỉ được hoàn thành khi các quản lý bảo dưỡng của cuộc hẹn đó hoàn thành: {}";
    public static final String LOG_ERR_CUSTOMER_EMAIL_NULL_OR_EMPTY = "Customer email is null or empty, cannot send in-progress email";

    // Info Logs
    public static final String LOG_INFO_SHOWING_APPOINTMENT = "Đang lấy lịch hẹn với id: {}";
    public static final String LOG_INFO_SHOWING_APPOINTMENT_LIST = "Đang lấy danh sách lịch hẹn: {}";
    public static final String LOG_INFO_CREATING_APPOINTMENT = "Đang tạo lịch hẹn: {}";
    public static final String LOG_INFO_UPDATING_APPOINTMENT = "Đang cập nhật lịch hẹn: {}";
    public static final String LOG_INFO_SHOWING_USER_APPOINTMENT = "Lấy thành công danh sách cuộc hẹn của người dùng: {}";
    public static final String LOG_INFO_CALCULATING_QUOTE_PRICE = "Đang tính giá tạm tính cho cuộc hẹn: {}";
    public static final String LOG_INFO_SHOWING_APPOINTMENT_CANCELLED_STATUS = "Đang lấy giá trị trạng thái CANCELLED của cuộc hen: {}";
    public static final String LOG_INFO_SHOWING_APPOINTMENT_IN_PROGRESS_STATUS = "Đang lấy giá trị trạng thái IN_PROGRESS của cuộc hen: {}";
    public static final String LOG_INFO_SHOWING_SERVICE_MODE_LIST = "Đang lấy danh sách chế độ dịch vụ cuộc hen: {}";
    public static final String LOG_INFO_APPOINTMENT_STATUS_UPDATE = "Đang cập nhật trạng thái Appointment {} từ {} → {}";
    public static final String LOG_INFO_UPDATING_APPOINTMENT_BY_CUSTOMER = "Đang cập nhật thông tin khách hàng trong cuộc hẹn, id cuộc hẹn: {}";
    public static final String LOG_INFO_SENT_IN_PROGRESS_EMAIL = "Sent in-progress email to customer: {}";
    public static final String LOG_ERR_FAILED_SEND_IN_PROGRESS_EMAIL = "Failed to send in-progress email: {}";
    
    // Email Content
    public static final String EMAIL_SUBJECT_IN_PROGRESS = "Thông báo bắt đầu dịch vụ bảo dưỡng xe điện";
    public static final String EMAIL_BODY_IN_PROGRESS_GREETING = "Xin chào %s,\n\n";
    public static final String EMAIL_BODY_IN_PROGRESS_CONTENT = "Chúng tôi xin thông báo rằng dịch vụ bảo dưỡng xe điện của bạn đã bắt đầu được thực hiện.\n\n";
    public static final String EMAIL_BODY_IN_PROGRESS_APPOINTMENT_INFO = "Thông tin cuộc hẹn:\n";
    public static final String EMAIL_BODY_IN_PROGRESS_APPOINTMENT_ID = "- Mã cuộc hẹn: %s\n";
    public static final String EMAIL_BODY_IN_PROGRESS_VEHICLE = "- Biển số xe: %s\n";
    public static final String EMAIL_BODY_IN_PROGRESS_TIME = "- Thời gian dự kiến: %s\n\n";
    public static final String EMAIL_BODY_IN_PROGRESS_FOOTER = "Chúng tôi sẽ cập nhật tiến độ dịch vụ cho bạn.\n\nTrân trọng,\nEV Care Team";


    // Success Logs
    public static final String LOG_SUCCESS_SHOWING_APPOINTMENT = "Lấy lịch hẹn thành công: {}";
    public static final String LOG_SUCCESS_SHOWING_SEARCH_APPOINTMENT_FOR_CUSTOMER = "Tra cứu thông tin cuộc hẹn của khách hàng thành công: {}";
    public static final String LOG_SUCCESS_SHOWING_SEARCH_APPOINTMENT_FOR_GUEST = "Tra cứu thông tin cuộc hẹn của khách vãng lai thành công: {}";
    public static final String LOG_SUCCESS_SHOWING_APPOINTMENT_LIST = "Lấy danh sách lịch hẹn thành công: {}";
    public static final String LOG_SUCCESS_CREATING_APPOINTMENT = "Tạo lịch hẹn thành công: {}";
    public static final String LOG_SUCCESS_UPDATING_APPOINTMENT_CUSTOMER = "Cập nhật lịch hẹn thành công cho người dùng: {}";
    public static final String LOG_SUCCESS_UPDATING_APPOINTMENT_ADMIN = "Cập nhật lịch hẹn thành công cho admin: {}";
    public static final String LOG_SUCCESS_UPDATING_APPOINTMENT_STATUS = "Cập nhật trạng thái lịch hẹn thành công cho admin: {}";
    public static final String LOG_SUCCESS_SHOWING_USER_APPOINTMENT = "Lấy thành công danh sách cuộc hẹn của người dùng: {}";
    public static final String LOG_SUCCESS_CALCULATING_QUOTE_PRICE = "Giá tạm tính được tính thành công: {}";
    public static final String LOG_SUCCESS_SHOWING_APPOINTMENT_CANCELLED_STATUS = "Lấy trạng thái CANCELLED của cuộc hẹn thành công: {}";
    public static final String LOG_SUCCESS_SHOWING_APPOINTMENT_IN_PROGRESS_STATUS = "Lấy trạng thái IN_PROGRESS của cuộc hẹn thành công: {}";
    public static final String LOG_SUCCESS_SHOWING_SERVICE_MODE_LIST = "Lấy danh sách chế độ dịch vụ cuộc hen thành công: {}";
    
    // Auto-create Shift Logs
    public static final String LOG_INFO_AUTO_CREATING_SHIFT = "Auto-creating shift for appointment: {}";
    public static final String LOG_INFO_TOTAL_SERVICE_DURATION = "Total service duration: {} minutes from {} services";
    public static final String LOG_WARN_NO_SERVICES_DEFAULT_DURATION = "No services found, using default 120 minutes";
    public static final String LOG_INFO_CALCULATED_SHIFT_TIME = "Calculated shift time: {} -> {} ({} hours)";
    public static final String LOG_SUCCESS_AUTO_CREATED_SHIFT = "Successfully auto-created shift {} for appointment {} (endTime: {}, totalHours: {})";
    public static final String LOG_ERR_AUTO_CREATING_SHIFT = "Error auto-creating shift for appointment {}: {}";



    // Endpoint
    public static final String BASE_URL = EndpointConstants.V1.API + "/appointment";
    public static final String APPOINTMENT_LIST = "/";
    public static final String APPOINTMENT = "/{id}";
    public static final String SEARCH_BY_CUSTOMER = "/search/customer/";
    public static final String SEARCH_BY_GUEST = "/search/guest/";
    public static final String APPOINTMENT_BY_USER_ID = "/user/{user-id}";
    public static final String APPOINTMENT_UPDATE_CUSTOMER = "/customer/{id}";
    public static final String APPOINTMENT_UPDATE_ADMIN = "/ADMIN{id}";
    public static final String APPOINTMENT_UPDATE_STATUS = "/status/{id}";
    public static final String SERVICE_MODE = "/service-mode/";
    public static final String CANCEL_STATUS = "/cancel-status/";
    public static final String IN_PROGRESS_STATUS = "/in-progress-status/";
    public static final String APPOINTMENT_CREATION = "/";
}
