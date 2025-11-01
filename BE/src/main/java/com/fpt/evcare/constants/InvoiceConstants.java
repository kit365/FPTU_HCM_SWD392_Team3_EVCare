package com.fpt.evcare.constants;

public class InvoiceConstants {
    // Success Messages
    public static final String MESSAGE_SUCCESS_SHOWING_INVOICE = "Lấy hóa đơn thành công";
    public static final String MESSAGE_SUCCESS_SHOWING_INVOICE_LIST = "Lấy danh sách hóa đơn thành công";
    public static final String MESSAGE_SUCCESS_CREATING_INVOICE = "Tạo hóa đơn thành công";
    public static final String MESSAGE_SUCCESS_UPDATING_INVOICE = "Cập nhật hóa đơn thành công";
    public static final String MESSAGE_SUCCESS_DELETING_INVOICE = "Xóa hóa đơn thành công";
    public static final String MESSAGE_SUCCESS_RESTORING_INVOICE = "Khôi phục hóa đơn thành công";
    public static final String MESSAGE_SUCCESS_SHOWING_CUSTOMER_INVOICES = "Lấy danh sách hóa đơn của khách hàng thành công";

    // Error Messages
    public static final String MESSAGE_ERR_INVOICE_NOT_FOUND = "Không tìm thấy hóa đơn";
    public static final String MESSAGE_ERR_INVOICE_LIST_NOT_FOUND = "Không tìm thấy danh sách hóa đơn";
    public static final String MESSAGE_ERR_APPOINTMENT_NOT_FOUND = "Không tìm thấy cuộc hẹn";
    public static final String MESSAGE_ERR_PAYMENT_METHOD_NOT_FOUND = "Không tìm thấy phương thức thanh toán";
    public static final String MESSAGE_ERR_INVOICE_ALREADY_DELETED = "Hóa đơn đã bị xóa";
    public static final String MESSAGE_ERR_INVOICE_NOT_DELETED = "Hóa đơn chưa bị xóa";
    public static final String MESSAGE_ERR_INVALID_STATUS = "Trạng thái hóa đơn không hợp lệ";
    public static final String MESSAGE_ERR_INVALID_AMOUNT = "Số tiền không hợp lệ";
    public static final String MESSAGE_ERR_PAID_AMOUNT_EXCEEDS_TOTAL = "Số tiền đã thanh toán không được vượt quá tổng tiền hóa đơn";
    public static final String MESSAGE_ERR_PAYMENT_AMOUNT_MUST_BE_POSITIVE = "Số tiền thanh toán phải lớn hơn 0";

    // Error Logs
    public static final String LOG_ERR_INVOICE_NOT_FOUND = "Không tìm thấy hóa đơn với id: {}";
    public static final String LOG_ERR_INVOICE_LIST_NOT_FOUND = "Không tìm thấy danh sách hóa đơn";
    public static final String LOG_ERR_APPOINTMENT_NOT_FOUND = "Không tìm thấy cuộc hẹn với id: {}";
    public static final String LOG_ERR_PAYMENT_METHOD_NOT_FOUND = "Không tìm thấy phương thức thanh toán với id: {}";
    public static final String LOG_ERR_INVALID_STATUS = "Trạng thái hóa đơn không hợp lệ: {}";
    public static final String LOG_ERR_INVALID_PAID_AMOUNT_EXCEEDS_TOTAL = "Invalid paid_amount: {} exceeds total_amount: {}";
    public static final String LOG_ERR_CUSTOMER_EMAIL_NULL_OR_EMPTY = "Customer email is null or empty, cannot send payment confirmation email";

    // Info Logs
    public static final String LOG_INFO_SHOWING_INVOICE = "Đang lấy hóa đơn với id: {}";
    public static final String LOG_INFO_SHOWING_INVOICE_LIST = "Đang lấy danh sách hóa đơn";
    public static final String LOG_INFO_CREATING_INVOICE = "Đang tạo hóa đơn";
    public static final String LOG_INFO_UPDATING_INVOICE = "Đang cập nhật hóa đơn với id: {}";
    public static final String LOG_INFO_DELETING_INVOICE = "Đang xóa hóa đơn với id: {}";
    public static final String LOG_INFO_RESTORING_INVOICE = "Đang khôi phục hóa đơn với id: {}";
    public static final String LOG_INFO_SHOWING_CUSTOMER_INVOICES = "Đang lấy danh sách hóa đơn của khách hàng với id: {}";
    public static final String LOG_INFO_PROCESSING_CASH_PAYMENT = "Processing cash payment for invoice: {}";
    public static final String LOG_INFO_INVOICE_FULLY_PAID = "Invoice {} fully paid, status changed to PAID";
    public static final String LOG_INFO_CASH_PAYMENT_PROCESSED = "Cash payment processed successfully for invoice: {}";
    public static final String LOG_INFO_UPDATED_PAYMENT_METHOD_LAST_USED = "Updated last_used_at for payment method: {}";
    public static final String LOG_INFO_SENT_PAYMENT_CONFIRMATION_EMAIL = "Sent payment confirmation email to customer: {}";

    // Success Logs
    public static final String LOG_SUCCESS_SHOWING_INVOICE = "Lấy hóa đơn thành công với id: {}";
    public static final String LOG_SUCCESS_SHOWING_INVOICE_LIST = "Lấy danh sách hóa đơn thành công";
    public static final String LOG_SUCCESS_CREATING_INVOICE = "Tạo hóa đơn thành công với id: {}";
    public static final String LOG_SUCCESS_UPDATING_INVOICE = "Cập nhật hóa đơn thành công với id: {}";
    public static final String LOG_SUCCESS_DELETING_INVOICE = "Xóa hóa đơn thành công với id: {}";
    public static final String LOG_SUCCESS_RESTORING_INVOICE = "Khôi phục hóa đơn thành công với id: {}";
    public static final String LOG_SUCCESS_SHOWING_CUSTOMER_INVOICES = "Lấy danh sách hóa đơn của khách hàng thành công với id: {}";
    public static final String LOG_ERR_FAILED_SEND_PAYMENT_CONFIRMATION_EMAIL = "Failed to send payment confirmation email: {}";
    public static final String LOG_INFO_SENT_PAYMENT_FAILED_EMAIL = "Sent payment failed email to customer: {}";
    public static final String LOG_ERR_FAILED_SEND_PAYMENT_FAILED_EMAIL = "Failed to send payment failed email: {}";
    
    // Email Content - Payment Confirmation
    public static final String EMAIL_SUBJECT_PAYMENT_CONFIRMATION = "Xác nhận thanh toán hóa đơn thành công";
    public static final String EMAIL_BODY_PAYMENT_CONFIRMATION_GREETING = "Xin chào %s,\n\n";
    public static final String EMAIL_BODY_PAYMENT_CONFIRMATION_CONTENT = "Chúng tôi xin thông báo rằng thanh toán của bạn đã được xác nhận thành công.\n\n";
    public static final String EMAIL_BODY_PAYMENT_CONFIRMATION_INVOICE_INFO = "Thông tin hóa đơn:\n";
    public static final String EMAIL_BODY_PAYMENT_CONFIRMATION_INVOICE_ID = "- Mã hóa đơn: %s\n";
    public static final String EMAIL_BODY_PAYMENT_CONFIRMATION_AMOUNT = "- Số tiền: %s VNĐ\n";
    public static final String EMAIL_BODY_PAYMENT_CONFIRMATION_DATE = "- Ngày thanh toán: %s\n\n";
    public static final String EMAIL_BODY_PAYMENT_CONFIRMATION_FOOTER = "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!\n\nTrân trọng,\nEV Care Team";
    
    // Email Content - Payment Failed
    public static final String EMAIL_SUBJECT_PAYMENT_FAILED = "Thông báo thanh toán hóa đơn thất bại";
    public static final String EMAIL_BODY_PAYMENT_FAILED_GREETING = "Xin chào %s,\n\n";
    public static final String EMAIL_BODY_PAYMENT_FAILED_CONTENT = "Chúng tôi rất tiếc phải thông báo rằng thanh toán của bạn không thể được xử lý.\n\n";
    public static final String EMAIL_BODY_PAYMENT_FAILED_INVOICE_INFO = "Thông tin hóa đơn:\n";
    public static final String EMAIL_BODY_PAYMENT_FAILED_INVOICE_ID = "- Mã hóa đơn: %s\n";
    public static final String EMAIL_BODY_PAYMENT_FAILED_AMOUNT = "- Tổng tiền: %s VNĐ\n";
    public static final String EMAIL_BODY_PAYMENT_FAILED_REASON = "- Lý do: %s\n\n";
    public static final String EMAIL_BODY_PAYMENT_FAILED_FOOTER = "Vui lòng kiểm tra lại thông tin và thử thanh toán lại. Nếu cần hỗ trợ, vui lòng liên hệ với chúng tôi.\n\nTrân trọng,\nEV Care Team";
}
