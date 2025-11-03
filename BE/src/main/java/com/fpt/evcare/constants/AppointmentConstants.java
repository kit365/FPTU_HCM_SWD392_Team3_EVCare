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
    public static final String LOG_INFO_APPOINTMENT_STATUS_AUTO_UPDATED = "Cuộc hẹn có ID [{}] đã được tự động chuyển từ {} sang {}.";
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
    public static final String LOG_INFO_SENT_CONFIRMED_EMAIL = "Sent confirmed email to customer: {}";
    public static final String LOG_ERR_FAILED_SEND_CONFIRMED_EMAIL = "Failed to send confirmed email: {}";
    public static final String LOG_INFO_SENT_COMPLETED_EMAIL = "Sent completed email to customer: {}";
    public static final String LOG_ERR_FAILED_SEND_COMPLETED_EMAIL = "Failed to send completed email: {}";
    public static final String LOG_INFO_SENT_CANCELLED_EMAIL = "Sent cancelled email to customer: {}";
    public static final String LOG_ERR_FAILED_SEND_CANCELLED_EMAIL = "Failed to send cancelled email: {}";
    public static final String LOG_INFO_SENT_PENDING_PAYMENT_EMAIL = "Sent pending payment email to customer: {}";
    public static final String LOG_ERR_FAILED_SEND_PENDING_PAYMENT_EMAIL = "Failed to send pending payment email: {}";
    public static final String LOG_INFO_SENT_PENDING_EMAIL = "Sent pending email to customer: {}";
    public static final String LOG_ERR_FAILED_SEND_PENDING_EMAIL = "Failed to send pending email: {}";
    
    // Email Content - PENDING (khi tạo appointment)
    public static final String EMAIL_SUBJECT_PENDING = "Xác nhận đặt lịch hẹn bảo dưỡng xe điện";
    public static final String EMAIL_BODY_PENDING_GREETING = "Xin chào %s,\n\n";
    public static final String EMAIL_BODY_PENDING_CONTENT = "Cảm ơn bạn đã đặt lịch hẹn bảo dưỡng xe điện với chúng tôi. Lịch hẹn của bạn đã được tạo và đang chờ xác nhận.\n\n";
    public static final String EMAIL_BODY_PENDING_APPOINTMENT_INFO = "Thông tin cuộc hẹn:\n";
    public static final String EMAIL_BODY_PENDING_APPOINTMENT_ID = "- Mã cuộc hẹn: %s\n";
    public static final String EMAIL_BODY_PENDING_VEHICLE = "- Biển số xe: %s\n";
    public static final String EMAIL_BODY_PENDING_TIME = "- Thời gian hẹn: %s\n\n";
    public static final String EMAIL_BODY_PENDING_FOOTER = "Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để xác nhận lịch hẹn.\n\nTrân trọng,\nEV Care Team";
    
    // Email Content - IN_PROGRESS
    public static final String EMAIL_SUBJECT_IN_PROGRESS = "Thông báo bắt đầu dịch vụ bảo dưỡng xe điện";
    public static final String EMAIL_BODY_IN_PROGRESS_GREETING = "Xin chào %s,\n\n";
    public static final String EMAIL_BODY_IN_PROGRESS_CONTENT = "Chúng tôi xin thông báo rằng dịch vụ bảo dưỡng xe điện của bạn đã bắt đầu được thực hiện.\n\n";
    public static final String EMAIL_BODY_IN_PROGRESS_APPOINTMENT_INFO = "Thông tin cuộc hẹn:\n";
    public static final String EMAIL_BODY_IN_PROGRESS_APPOINTMENT_ID = "- Mã cuộc hẹn: %s\n";
    public static final String EMAIL_BODY_IN_PROGRESS_VEHICLE = "- Biển số xe: %s\n";
    public static final String EMAIL_BODY_IN_PROGRESS_TIME = "- Thời gian dự kiến: %s\n\n";
    public static final String EMAIL_BODY_IN_PROGRESS_FOOTER = "Chúng tôi sẽ cập nhật tiến độ dịch vụ cho bạn.\n\nTrân trọng,\nEV Care Team";
    
    // Email Content - CONFIRMED
    public static final String EMAIL_SUBJECT_CONFIRMED = "Xác nhận cuộc hẹn bảo dưỡng xe điện";
    public static final String EMAIL_BODY_CONFIRMED_GREETING = "Xin chào %s,\n\n";
    public static final String EMAIL_BODY_CONFIRMED_CONTENT = "Cuộc hẹn bảo dưỡng xe điện của bạn đã được xác nhận.\n\n";
    public static final String EMAIL_BODY_CONFIRMED_APPOINTMENT_INFO = "Thông tin cuộc hẹn:\n";
    public static final String EMAIL_BODY_CONFIRMED_APPOINTMENT_ID = "- Mã cuộc hẹn: %s\n";
    public static final String EMAIL_BODY_CONFIRMED_VEHICLE = "- Biển số xe: %s\n";
    public static final String EMAIL_BODY_CONFIRMED_TIME = "- Thời gian hẹn: %s\n";
    public static final String EMAIL_BODY_CONFIRMED_ASSIGNEE = "- Kỹ thuật viên: %s\n\n";
    public static final String EMAIL_BODY_CONFIRMED_FOOTER = "Vui lòng đến đúng giờ hẹn để được phục vụ tốt nhất.\n\nTrân trọng,\nEV Care Team";
    
    // Email Content - COMPLETED
    public static final String EMAIL_SUBJECT_COMPLETED = "Hoàn thành dịch vụ bảo dưỡng xe điện";
    public static final String EMAIL_BODY_COMPLETED_GREETING = "Xin chào %s,\n\n";
    public static final String EMAIL_BODY_COMPLETED_CONTENT = "Cuộc hẹn bảo dưỡng xe điện của bạn đã được hoàn thành thành công.\n\n";
    public static final String EMAIL_BODY_COMPLETED_APPOINTMENT_INFO = "Thông tin cuộc hẹn:\n";
    public static final String EMAIL_BODY_COMPLETED_APPOINTMENT_ID = "- Mã cuộc hẹn: %s\n";
    public static final String EMAIL_BODY_COMPLETED_VEHICLE = "- Biển số xe: %s\n\n";
    public static final String EMAIL_BODY_COMPLETED_FOOTER = "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!\n\nTrân trọng,\nEV Care Team";
    
    // Email Content - CANCELLED
    public static final String EMAIL_SUBJECT_CANCELLED = "Thông báo hủy cuộc hẹn bảo dưỡng xe điện";
    public static final String EMAIL_BODY_CANCELLED_GREETING = "Xin chào %s,\n\n";
    public static final String EMAIL_BODY_CANCELLED_CONTENT = "Cuộc hẹn bảo dưỡng xe điện của bạn đã bị hủy.\n\n";
    public static final String EMAIL_BODY_CANCELLED_APPOINTMENT_INFO = "Thông tin cuộc hẹn đã hủy:\n";
    public static final String EMAIL_BODY_CANCELLED_APPOINTMENT_ID = "- Mã cuộc hẹn: %s\n";
    public static final String EMAIL_BODY_CANCELLED_VEHICLE = "- Biển số xe: %s\n";
    public static final String EMAIL_BODY_CANCELLED_TIME = "- Thời gian đã hẹn: %s\n\n";
    public static final String EMAIL_BODY_CANCELLED_FOOTER = "Nếu bạn muốn đặt lại cuộc hẹn, vui lòng liên hệ với chúng tôi.\n\nTrân trọng,\nEV Care Team";
    
    // Email Content - PENDING_PAYMENT
    public static final String EMAIL_SUBJECT_PENDING_PAYMENT = "Thông báo chờ thanh toán dịch vụ bảo dưỡng";
    public static final String EMAIL_BODY_PENDING_PAYMENT_GREETING = "Xin chào %s,\n\n";
    public static final String EMAIL_BODY_PENDING_PAYMENT_CONTENT = "Dịch vụ bảo dưỡng xe điện của bạn đã hoàn thành. Vui lòng thanh toán để hoàn tất.\n\n";
    public static final String EMAIL_BODY_PENDING_PAYMENT_APPOINTMENT_INFO = "Thông tin cuộc hẹn:\n";
    public static final String EMAIL_BODY_PENDING_PAYMENT_APPOINTMENT_ID = "- Mã cuộc hẹn: %s\n";
    public static final String EMAIL_BODY_PENDING_PAYMENT_VEHICLE = "- Biển số xe: %s\n";
    public static final String EMAIL_BODY_PENDING_PAYMENT_INVOICE_INFO = "\nThông tin hóa đơn:\n";
    public static final String EMAIL_BODY_PENDING_PAYMENT_INVOICE_ID = "- Mã hóa đơn: %s\n";
    public static final String EMAIL_BODY_PENDING_PAYMENT_TOTAL_AMOUNT = "- Tổng tiền: %s VNĐ\n\n";
    public static final String EMAIL_BODY_PENDING_PAYMENT_FOOTER = "Vui lòng thanh toán theo hóa đơn đính kèm để hoàn tất dịch vụ.\n\nTrân trọng,\nEV Care Team";


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
    public static final String APPOINTMENT_CANCEL_CUSTOMER = "/cancel/customer/{id}";
    public static final String SERVICE_MODE = "/service-mode/";
    public static final String CANCEL_STATUS = "/cancel-status/";
    public static final String IN_PROGRESS_STATUS = "/in-progress-status/";
    public static final String APPOINTMENT_CREATION = "/";
    
    // Messages for customer cancel appointment
    public static final String MESSAGE_SUCCESS_CANCELLING_APPOINTMENT_CUSTOMER = "Hủy cuộc hẹn thành công";
    public static final String LOG_SUCCESS_CANCELLING_APPOINTMENT_CUSTOMER = "Customer cancelled appointment: {}";
    public static final String MESSAGE_ERR_CANNOT_CANCEL_NON_PENDING_APPOINTMENT = "Chỉ có thể hủy cuộc hẹn khi đang ở trạng thái PENDING (Chờ xác nhận)";
    public static final String LOG_ERR_CANNOT_CANCEL_NON_PENDING_APPOINTMENT = "Cannot cancel appointment that is not in PENDING status: {}";
    
    // OTP for guest appointment endpoints
    public static final String APPOINTMENT_GUEST_SEND_OTP = "/guest/{id}/send-otp";
    public static final String APPOINTMENT_GUEST_VERIFY_OTP = "/guest/{id}/verify-otp";
    public static final String APPOINTMENT_GUEST_GET = "/guest/{id}";
    public static final String APPOINTMENT_GUEST_UPDATE = "/guest/{id}";
    
    // OTP messages
    public static final String MESSAGE_SUCCESS_SEND_OTP_FOR_GUEST = "Đã gửi mã OTP đến email của bạn";
    public static final String MESSAGE_SUCCESS_VERIFY_OTP_FOR_GUEST = "Xác thực OTP thành công";
    public static final String MESSAGE_ERR_OTP_INVALID = "Mã OTP không hợp lệ hoặc đã hết hạn";
    public static final String MESSAGE_ERR_APPOINTMENT_EMAIL_NOT_MATCH = "Email không khớp với cuộc hẹn này";
    public static final String LOG_SUCCESS_SEND_OTP_FOR_GUEST = "Sent OTP for guest appointment: {}";
    public static final String LOG_SUCCESS_VERIFY_OTP_FOR_GUEST = "Verified OTP for guest appointment: {}";
    public static final String LOG_ERR_OTP_INVALID = "Invalid OTP for appointment: {}";
}
