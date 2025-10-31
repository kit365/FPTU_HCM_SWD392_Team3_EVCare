package com.fpt.evcare.constants;

public class MessageConstants {
    
    // Success Messages
    public static final String MESSAGE_SUCCESS_SEND = "Gửi tin nhắn thành công";
    public static final String MESSAGE_SUCCESS_MARK_READ = "Đánh dấu đã đọc thành công";
    public static final String MESSAGE_SUCCESS_MARK_DELIVERED = "Đánh dấu đã nhận thành công";
    public static final String MESSAGE_SUCCESS_DELETE = "Xóa tin nhắn thành công";
    public static final String MESSAGE_SUCCESS_ASSIGN = "Phân công chat thành công";
    public static final String MESSAGE_SUCCESS_REASSIGN = "Chuyển phân công chat thành công";
    
    // Error Messages
    public static final String MESSAGE_ERR_NOT_FOUND = "Không tìm thấy tin nhắn";
    public static final String MESSAGE_ERR_UNAUTHORIZED = "Bạn không có quyền truy cập tin nhắn này";
    public static final String MESSAGE_ERR_EMPTY_CONTENT = "Nội dung tin nhắn không được để trống";
    public static final String MESSAGE_ERR_SENDER_NOT_FOUND = "Không tìm thấy người gửi";
    public static final String MESSAGE_ERR_RECEIVER_NOT_FOUND = "Không tìm thấy người nhận";
    public static final String MESSAGE_ERR_SEND_TO_SELF = "Không thể gửi tin nhắn cho chính mình";
    public static final String MESSAGE_ERR_NO_ASSIGNMENT = "Customer chưa được phân công chat với staff nào";
    public static final String MESSAGE_ERR_ASSIGNMENT_NOT_FOUND = "Không tìm thấy phân công chat";
    public static final String MESSAGE_ERR_CUSTOMER_NOT_ASSIGNED = "Customer này chưa được phân công";
    public static final String MESSAGE_ERR_INVALID_STAFF = "Staff không hợp lệ";
    public static final String MESSAGE_ERR_CUSTOMER_ALREADY_ASSIGNED = "Customer đã được phân công cho staff khác";
    
    // Log Messages
    public static final String LOG_SUCCESS_SEND_MESSAGE = "✅ Gửi tin nhắn thành công từ {} đến {}";
    public static final String LOG_SUCCESS_MARK_READ = "✅ Đánh dấu tin nhắn {} đã đọc bởi {}";
    public static final String LOG_SUCCESS_MARK_DELIVERED = "✅ Đánh dấu tin nhắn {} đã nhận bởi {}";
    public static final String LOG_SUCCESS_ASSIGN = "✅ Phân công customer {} cho staff {}";
    public static final String LOG_SUCCESS_REASSIGN = "✅ Chuyển customer {} từ staff {} sang {}";
    public static final String LOG_ERR_MESSAGE_NOT_FOUND = "❌ Không tìm thấy tin nhắn với id: {}";
    public static final String LOG_ERR_UNAUTHORIZED = "❌ User {} không có quyền truy cập tin nhắn {}";
    public static final String LOG_ERR_NO_ASSIGNMENT = "❌ Customer {} chưa được phân công chat";
    
    // WebSocket Topics
    public static final String WS_TOPIC_USER_MESSAGES = "/queue/messages";
    public static final String WS_TOPIC_USER_TYPING = "/user/{userId}/queue/typing";
    public static final String WS_TOPIC_USER_ONLINE = "/user/{userId}/queue/online-status";
    public static final String WS_DESTINATION_SEND_MESSAGE = "/app/message/send";
    public static final String WS_DESTINATION_MARK_READ = "/app/message/mark-read";
    public static final String WS_DESTINATION_MARK_DELIVERED = "/app/message/mark-delivered";
    public static final String WS_DESTINATION_TYPING = "/app/message/typing";
}

