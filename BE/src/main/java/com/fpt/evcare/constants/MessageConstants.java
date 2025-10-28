package com.fpt.evcare.constants;

public class MessageConstants {

    // ============================
    // ✅ Success messages
    // ============================
    public static final String MESSAGE_SUCCESS_SENDING_MESSAGE = "Gửi tin nhắn thành công";
    public static final String MESSAGE_SUCCESS_MARKING_MESSAGE_AS_READ = "Đánh dấu tin nhắn đã đọc thành công";
    public static final String MESSAGE_SUCCESS_DELETING_MESSAGE = "Xóa tin nhắn thành công";
    public static final String MESSAGE_SUCCESS_GETTING_MESSAGE = "Lấy thông tin tin nhắn thành công";
    public static final String MESSAGE_SUCCESS_GETTING_CONVERSATION = "Lấy cuộc trò chuyện thành công";

    // ============================
    // ❌ Failed messages
    // ============================
    public static final String MESSAGE_ERR_MESSAGE_NOT_FOUND = "Không tìm thấy tin nhắn";
    public static final String MESSAGE_ERR_USER_NOT_FOUND = "Không tìm thấy người dùng";
    public static final String MESSAGE_ERR_CANNOT_SEND_TO_SELF = "Không thể gửi tin nhắn cho chính mình";
    public static final String MESSAGE_ERR_UNAUTHORIZED = "Bạn không có quyền xem tin nhắn này";
    public static final String MESSAGE_ERR_EMPTY_CONTENT = "Nội dung tin nhắn không được để trống";

    // ============================
    // ℹ️ Info logs
    // ============================
    public static final String LOG_INFO_SENDING_MESSAGE = "Đang gửi tin nhắn từ {} đến {}";
    public static final String LOG_INFO_GETTING_CONVERSATION = "Đang lấy cuộc trò chuyện giữa {} và {}";
    public static final String LOG_INFO_MARKING_MESSAGE_AS_READ = "Đang đánh dấu tin nhắn {} đã đọc";
    public static final String LOG_INFO_DELETING_MESSAGE = "Đang xóa tin nhắn: {}";

    // ============================
    // ⚠️ Error logs
    // ============================
    public static final String LOG_ERR_MESSAGE_NOT_FOUND = "Không tìm thấy tin nhắn với id: {}";
    public static final String LOG_ERR_USER_NOT_FOUND = "Không tìm thấy người dùng với id: {}";
    public static final String LOG_ERR_CANNOT_SEND_TO_SELF = "Người dùng {} không thể gửi tin nhắn cho chính mình";
    public static final String LOG_ERR_UNAUTHORIZED = "Người dùng {} không có quyền xem tin nhắn {}";
    public static final String LOG_ERR_EMPTY_CONTENT = "Nội dung tin nhắn trống";

    // ============================
    // ✅ Success logs
    // ============================
    public static final String LOG_SUCCESS_SENDING_MESSAGE = "Gửi tin nhắn thành công: {}";
    public static final String LOG_SUCCESS_MARKING_MESSAGE_AS_READ = "Đánh dấu tin nhắn đã đọc thành công: {}";
    public static final String LOG_SUCCESS_DELETING_MESSAGE = "Xóa tin nhắn thành công: {}";
    public static final String LOG_SUCCESS_GETTING_CONVERSATION = "Lấy cuộc trò chuyện thành công";

    // ============================
    // 🌐 Endpoint constants
    // ============================
    public static final String BASE_URL = EndpointConstants.V1.API + "/messages";
    public static final String MESSAGE_LIST = "";
    public static final String MESSAGE_DETAIL = "/{id}";
    public static final String MESSAGE_SEND = "";
    public static final String MESSAGE_MARK_READ = "/{id}/read";
    public static final String MESSAGE_DELETE = "/{id}";
    public static final String MESSAGE_CONVERSATION = "/conversation/{userId}";
    public static final String MESSAGE_UNREAD_COUNT = "/unread-count";
}


