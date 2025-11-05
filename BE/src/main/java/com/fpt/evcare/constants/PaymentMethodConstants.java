package com.fpt.evcare.constants;

public class PaymentMethodConstants {
    // Success Messages
    public static final String MESSAGE_SUCCESS_SHOWING_PAYMENT_METHOD = "Lấy phương thức thanh toán thành công";
    public static final String MESSAGE_SUCCESS_SHOWING_PAYMENT_METHOD_LIST = "Lấy danh sách phương thức thanh toán thành công";
    public static final String MESSAGE_SUCCESS_CREATING_PAYMENT_METHOD = "Tạo phương thức thanh toán thành công";
    public static final String MESSAGE_SUCCESS_UPDATING_PAYMENT_METHOD = "Cập nhật phương thức thanh toán thành công";
    public static final String MESSAGE_SUCCESS_DELETING_PAYMENT_METHOD = "Xóa phương thức thanh toán thành công";
    public static final String MESSAGE_SUCCESS_RESTORING_PAYMENT_METHOD = "Khôi phục phương thức thanh toán thành công";
    public static final String MESSAGE_SUCCESS_SHOWING_USER_PAYMENT_METHODS = "Lấy danh sách phương thức thanh toán của người dùng thành công";

    // Error Messages
    public static final String MESSAGE_ERR_PAYMENT_METHOD_NOT_FOUND = "Không tìm thấy phương thức thanh toán";
    public static final String MESSAGE_ERR_PAYMENT_METHOD_LIST_NOT_FOUND = "Không tìm thấy danh sách phương thức thanh toán";
    public static final String MESSAGE_ERR_USER_NOT_FOUND = "Không tìm thấy người dùng";
    public static final String MESSAGE_ERR_PAYMENT_METHOD_ALREADY_DELETED = "Phương thức thanh toán đã bị xóa";
    public static final String MESSAGE_ERR_PAYMENT_METHOD_NOT_DELETED = "Phương thức thanh toán chưa bị xóa";
    public static final String MESSAGE_ERR_INVALID_METHOD_TYPE = "Loại phương thức thanh toán không hợp lệ";
    public static final String MESSAGE_ERR_INVALID_STATUS = "Trạng thái không hợp lệ";
    public static final String MESSAGE_ERR_ACCOUNT_NUMBER_ALREADY_EXISTS = "Số tài khoản đã tồn tại";

    // Error Logs
    public static final String LOG_ERR_PAYMENT_METHOD_NOT_FOUND = "Không tìm thấy phương thức thanh toán với id: {}";
    public static final String LOG_ERR_PAYMENT_METHOD_LIST_NOT_FOUND = "Không tìm thấy danh sách phương thức thanh toán";
    public static final String LOG_ERR_USER_NOT_FOUND = "Không tìm thấy người dùng với id: {}";
    public static final String LOG_ERR_INVALID_METHOD_TYPE = "Loại phương thức thanh toán không hợp lệ: {}";
    public static final String LOG_ERR_INVALID_STATUS = "Trạng thái không hợp lệ: {}";

    // Info Logs
    public static final String LOG_INFO_SHOWING_PAYMENT_METHOD = "Đang lấy phương thức thanh toán với id: {}";
    public static final String LOG_INFO_SHOWING_PAYMENT_METHOD_LIST = "Đang lấy danh sách phương thức thanh toán";
    public static final String LOG_INFO_CREATING_PAYMENT_METHOD = "Đang tạo phương thức thanh toán";
    public static final String LOG_INFO_UPDATING_PAYMENT_METHOD = "Đang cập nhật phương thức thanh toán với id: {}";
    public static final String LOG_INFO_DELETING_PAYMENT_METHOD = "Đang xóa phương thức thanh toán với id: {}";
    public static final String LOG_INFO_RESTORING_PAYMENT_METHOD = "Đang khôi phục phương thức thanh toán với id: {}";
    public static final String LOG_INFO_SHOWING_USER_PAYMENT_METHODS = "Đang lấy danh sách phương thức thanh toán của người dùng với id: {}";

    // Success Logs
    public static final String LOG_SUCCESS_SHOWING_PAYMENT_METHOD = "Lấy phương thức thanh toán thành công với id: {}";
    public static final String LOG_SUCCESS_SHOWING_PAYMENT_METHOD_LIST = "Lấy danh sách phương thức thanh toán thành công";
    public static final String LOG_SUCCESS_CREATING_PAYMENT_METHOD = "Tạo phương thức thanh toán thành công với id: {}";
    public static final String LOG_SUCCESS_UPDATING_PAYMENT_METHOD = "Cập nhật phương thức thanh toán thành công với id: {}";
    public static final String LOG_SUCCESS_DELETING_PAYMENT_METHOD = "Xóa phương thức thanh toán thành công với id: {}";
    public static final String LOG_SUCCESS_RESTORING_PAYMENT_METHOD = "Khôi phục phương thức thanh toán thành công với id: {}";
    public static final String LOG_SUCCESS_SHOWING_USER_PAYMENT_METHODS = "Lấy danh sách phương thức thanh toán của người dùng thành công với id: {}";
    
    // VnPay specific constants
    public static final String MESSAGE_ERR_APPOINTMENT_CANCELLED_OR_INVALID = "Đơn hàng đã bị hủy hoặc không hợp lệ";
    public static final String MESSAGE_ERR_NO_INVOICE_FOUND_FOR_APPOINTMENT_VNPAY = "Không tìm thấy hóa đơn cho appointment này. Vui lòng tạo hóa đơn trước khi thanh toán.";
    public static final String MESSAGE_ERR_INVOICE_ALREADY_PAID_OR_CANCELLED_VNPAY = "Hóa đơn đã được thanh toán hoặc đã hủy";
    public static final String MESSAGE_ERR_APPOINTMENT_NOT_PENDING_PAYMENT_VNPAY = "Appointment không ở trạng thái chờ thanh toán";
    public static final String MESSAGE_ERR_INVOICE_NO_PRICE_OR_INVALID = "Hóa đơn chưa có giá hoặc giá không hợp lệ";
    public static final String LOG_INFO_CREATED_PAYMENT_TRANSACTION = "✅ Created PaymentTransaction: transactionReference={}, invoiceId={}, appointmentId={}";
    public static final String MESSAGE_ERR_ERROR_CREATING_VNPAY_PAYMENT_URL = "Lỗi khi tạo URL thanh toán VNPay";
    public static final String LOG_ERR_INVALID_SECURE_HASH_VNPAY = "❌ Invalid secure hash from VNPay for transactionReference: {}";
    public static final String MESSAGE_ERR_INVALID_SECURE_HASH_VNPAY = "Invalid secure hash from VNPay";
    
    // Additional VnPay log messages
    public static final String LOG_WARN_FAILED_PARSE_PAYMENT_DATE = "Failed to parse payment date: {}";
    public static final String LOG_WARN_PAID_AMOUNT_LESS_THAN_TOTAL_VNPAY = "Paid amount {} is less than total amount {}";
    public static final String MESSAGE_ERR_PAID_AMOUNT_MUST_EQUAL_TOTAL_VNPAY = "Số tiền thanh toán phải bằng tổng tiền hóa đơn. Đã nhận: %s, Cần: %s";
    public static final String LOG_INFO_INVOICE_MARKED_AS_PAID_VIA_VNPAY = "Invoice {} marked as PAID via VNPay";
    public static final String LOG_INFO_APPOINTMENT_MARKED_AS_COMPLETED_VNPAY = "Appointment {} marked as COMPLETED";
    public static final String LOG_INFO_PAYMENT_SUCCESSFUL_VNPAY = "✅ Payment successful: transactionReference={}, invoiceId={}, amount={}";
    public static final String LOG_WARN_PAYMENT_FAILED_VNPAY = "⚠️ Payment failed: transactionReference={}, status={}";
    public static final String MESSAGE_ERR_ERROR_CREATING_HMAC_SHA512_SIGNATURE = "Lỗi khi tạo chữ ký HMAC-SHA512";
    public static final String LOG_DEBUG_NO_SHIFTS_FOUND_TO_UPDATE_COMPLETED_VNPAY = "No shifts found for appointment {} to update to COMPLETED";
    public static final String LOG_INFO_AUTO_UPDATED_SHIFT_TO_COMPLETED_VNPAY = "✅ Auto-updated shift {} status to COMPLETED when appointment {} completed after VNPay payment";
    public static final String LOG_INFO_UPDATED_SHIFTS_TO_COMPLETED_VNPAY = "✅ Updated {} shift(s) to COMPLETED for appointment {} after VNPay payment";
    public static final String LOG_DEBUG_NO_SHIFTS_NEEDED_UPDATE_COMPLETED_VNPAY = "No shifts needed status update for appointment {} (all shifts are already COMPLETED or other status)";
    public static final String LOG_ERR_FAILED_UPDATE_SHIFT_STATUS_ON_VNPAY_PAYMENT = "⚠️ Failed to update shift status when appointment {} completed after VNPay payment: {}";
}
