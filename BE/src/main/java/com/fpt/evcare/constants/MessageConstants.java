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
    public static final String LOG_WARN_USER_SEND_MESSAGE_TO_SELF = "User {} tried to send message to themselves";
    public static final String LOG_WARN_CUSTOMER_CHAT_UNASSIGNED_STAFF = "Customer {} tried to chat with unassigned staff {}";
    public static final String LOG_INFO_DELETED_MESSAGE = "Deleted message: {}";
    
    // MessageAssignment constants
    public static final String MESSAGE_ERR_USER_NOT_CUSTOMER = "User không phải là customer";
    public static final String MESSAGE_ERR_NO_AVAILABLE_ONLINE_STAFF = "Không tìm thấy staff online khả dụng";
    public static final String LOG_INFO_CUSTOMER_ALREADY_ASSIGNED = "Customer {} already assigned to staff {}, updating assignment";
    public static final String LOG_INFO_DEACTIVATED_ASSIGNMENT = "Deactivated assignment: {}";
    public static final String LOG_INFO_CUSTOMER_ALREADY_ASSIGNED_TO_ONLINE_STAFF = "✅ Customer {} already assigned to ONLINE staff {}, keeping assignment";
    public static final String LOG_WARN_CURRENT_STAFF_OFFLINE = "⚠️ Current staff {} is OFFLINE or different, reassigning customer {} to online staff {}";
    public static final String LOG_INFO_UPDATED_EXISTING_ASSIGNMENT = "✅ Updated existing assignment for customer {} to online staff {}";
    public static final String LOG_INFO_CREATED_NEW_ASSIGNMENT = "✅ Created new assignment for customer {} to online staff {}";
    public static final String LOG_INFO_AUTO_ASSIGN_CUSTOMER = "✅ Auto-{} customer {} to online staff {} (least loaded)";
    public static final String LOG_DEBUG_SKIP_WELCOME_MESSAGE_ALREADY_SENT = "⏭️ Skipping welcome message (already sent recently from staff {} to customer {})";
    public static final String LOG_DEBUG_SKIP_WELCOME_MESSAGE_ALREADY_SENT_NEW_STAFF = "⏭️ Skipping welcome message (already sent recently from new staff {} to customer {})";
    public static final String LOG_INFO_CREATED_WELCOME_MESSAGE = "✅ Created welcome message from staff {} to customer {}";
    public static final String LOG_INFO_PUBLISHED_WELCOME_MESSAGE_EVENT = "✅ Published welcome message event to WebSocket";
    public static final String LOG_ERR_FAILED_PUBLISH_WELCOME_MESSAGE = "❌ Failed to publish welcome message event: {}";
    public static final String LOG_DEBUG_SKIP_WELCOME_MESSAGE_NOT_NEEDED = "⏭️ Skipping welcome message (same staff or not needed)";
    public static final String LOG_DEBUG_STAFF_NO_WEBSOCKET_SESSION = "   ⏭️ Staff {} ({} {}) has NO active WebSocket session - skipping";
    public static final String LOG_DEBUG_STAFF_HAS_WEBSOCKET_SESSION = "   ✅ Staff {} ({} {}) has active WebSocket session";
    public static final String LOG_WARN_NO_STAFF_WITH_WEBSOCKET_SESSION = "⚠️ No STAFF with active WebSocket session found (admin is excluded)";
    public static final String LOG_INFO_FOUND_STAFF_WITH_WEBSOCKET_SESSIONS = "📊 Found {} STAFF with active WebSocket sessions";
    public static final String LOG_INFO_STAFF_WITH_ACTIVE_CUSTOMERS = "   Staff {} ({} {}) (WebSocket ACTIVE) has {} active customers";
    public static final String LOG_INFO_SELECTED_STAFF_LEAST_LOADED = "✅ Selected STAFF {} ({} {}) with active WebSocket session and {} customers (least loaded)";
    public static final String LOG_ERR_NO_STAFF_SELECTED = "❌ No STAFF selected (should not happen)";
    
    // WebSocket Topics
    public static final String WS_TOPIC_USER_MESSAGES = "/queue/messages";
    public static final String WS_TOPIC_USER_TYPING = "/user/{userId}/queue/typing";
    public static final String WS_TOPIC_USER_ONLINE = "/user/{userId}/queue/online-status";
    public static final String WS_DESTINATION_SEND_MESSAGE = "/app/message/send";
    public static final String WS_DESTINATION_MARK_READ = "/app/message/mark-read";
    public static final String WS_DESTINATION_MARK_DELIVERED = "/app/message/mark-delivered";
    public static final String WS_DESTINATION_TYPING = "/app/message/typing";
}

