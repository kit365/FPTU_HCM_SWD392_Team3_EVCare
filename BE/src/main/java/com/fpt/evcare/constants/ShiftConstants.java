package com.fpt.evcare.constants;

public class ShiftConstants {
    
    // Log Info
    public static final String LOG_INFO_SHOWING_SHIFT_TYPE_LIST = "Showing shift type list";
    public static final String LOG_INFO_SHOWING_SHIFT_STATUS_LIST = "Showing shift status list";
    public static final String LOG_INFO_SHOWING_SHIFT_BY_ID = "Showing shift by id: {}";
    public static final String LOG_INFO_SHOWING_SHIFT_LIST = "Showing shift list";
    public static final String LOG_INFO_SHOWING_SHIFT_LIST_BY_APPOINTMENT_ID = "Showing shift list by appointment id: {}";
    public static final String LOG_INFO_CREATING_SHIFT = "Creating shift";
    public static final String LOG_INFO_UPDATING_SHIFT = "Updating shift with id: {}";
    public static final String LOG_INFO_DELETING_SHIFT = "Deleting shift with id: {}";
    public static final String LOG_INFO_RESTORING_SHIFT = "Restoring shift with id: {}";
    public static final String LOG_INFO_ASSIGNING_SHIFT = "Assigning shift with id: {}";
    
    // Log Error
    public static final String LOG_ERR_SHIFT_NOT_FOUND = "Shift not found";
    public static final String LOG_ERR_APPOINTMENT_NOT_FOUND = "Appointment not found for shift";
    public static final String LOG_ERR_CREATING_SHIFT = "Error creating shift";
    public static final String LOG_ERR_UPDATING_SHIFT = "Error updating shift";
    public static final String LOG_ERR_DELETING_SHIFT = "Error deleting shift";
    public static final String LOG_ERR_RESTORING_SHIFT = "Error restoring shift";
    public static final String LOG_ERR_UPDATING_SHIFT_STATUSES = "Error updating shift statuses";
    
    // Log Info - Availability & Scheduler
    public static final String LOG_INFO_CHECKING_AVAILABILITY = "Checking technician availability for {} technicians";
    public static final String LOG_INFO_FOUND_SHIFTS_TO_START = "Found {} shifts to start";
    public static final String LOG_INFO_FOUND_SHIFTS_TO_COMPLETE = "Found {} shifts to complete";
    public static final String LOG_INFO_FOUND_SHIFTS_LATE_ASSIGNMENT = "Found {} shifts with late assignment";
    public static final String LOG_INFO_UPDATED_SHIFT_TO_IN_PROGRESS = "Updated shift {} to IN_PROGRESS";
    public static final String LOG_INFO_UPDATED_SHIFT_TO_COMPLETED = "Updated shift {} to COMPLETED";
    public static final String LOG_INFO_UPDATED_SHIFT_TO_LATE_ASSIGNMENT = "Updated shift {} to LATE_ASSIGNMENT";
    public static final String LOG_INFO_SCHEDULER_RUNNING = "Running scheduled shift status update";
    public static final String LOG_INFO_SCHEDULER_COMPLETED = "Shift status update completed successfully";
    public static final String LOG_INFO_GETTING_AVAILABLE_TECHNICIANS = "Getting available technicians for time range: {} to {}";
    
    // Log Info - Shift Creation & Assignment
    public static final String LOG_INFO_CALCULATED_TOTAL_HOURS = "Calculated totalHours: {} hours";
    public static final String LOG_INFO_CALCULATED_TOTAL_HOURS_DETAIL = "Calculated totalHours: {} hours ({} minutes)";
    public static final String LOG_INFO_SHIFT_SAVED_SUCCESSFULLY = "Shift saved successfully: {}";
    public static final String LOG_INFO_SHIFT_ASSIGNEE = "Assignee: {}";
    public static final String LOG_INFO_SHIFT_STAFF = "Staff: {}";
    public static final String LOG_INFO_SHIFT_TECHNICIANS_COUNT = "Technicians count: {}";
    public static final String LOG_INFO_SHIFT_STATUS = "Status: {}";
    public static final String LOG_INFO_UPDATING_APPOINTMENT = "Updating appointment: {}";
    public static final String LOG_INFO_SETTING_ASSIGNEE = "Setting assignee: {}";
    public static final String LOG_INFO_SETTING_TECHNICIANS = "Setting {} technicians";
    public static final String LOG_INFO_APPOINTMENT_UPDATED_SUCCESSFULLY = "Appointment updated successfully";
    public static final String LOG_WARN_NO_APPOINTMENT_LINKED = "No appointment linked to this shift";
    public static final String LOG_INFO_SHIFT_ASSIGNMENT_COMPLETED = "Shift assignment completed successfully";
    
    // Message Success
    public static final String MESSAGE_SUCCESS_SHOWING_SHIFT_TYPE_LIST = "Lấy danh sách loại ca làm việc thành công";
    public static final String MESSAGE_SUCCESS_SHOWING_SHIFT_STATUS_LIST = "Lấy danh sách trạng thái ca làm việc thành công";
    public static final String MESSAGE_SUCCESS_SHOWING_SHIFT_BY_ID = "Lấy thông tin ca làm việc thành công";
    public static final String MESSAGE_SUCCESS_SHOWING_SHIFT_LIST = "Lấy danh sách ca làm việc thành công";
    public static final String MESSAGE_SUCCESS_CREATING_SHIFT = "Tạo ca làm việc thành công";
    public static final String MESSAGE_SUCCESS_UPDATING_SHIFT = "Cập nhật ca làm việc thành công";
    public static final String MESSAGE_SUCCESS_DELETING_SHIFT = "Xóa ca làm việc thành công";
    public static final String MESSAGE_SUCCESS_RESTORING_SHIFT = "Khôi phục ca làm việc thành công";
    public static final String MESSAGE_SUCCESS_ASSIGNING_SHIFT = "Phân công ca làm việc thành công";
    
    // Message Error
    public static final String MESSAGE_ERR_SHIFT_NOT_FOUND = "Không tìm thấy ca làm việc";
    public static final String MESSAGE_ERR_APPOINTMENT_NOT_FOUND = "Không tìm thấy lịch hẹn";
    public static final String MESSAGE_ERR_CREATING_SHIFT = "Lỗi khi tạo ca làm việc";
    public static final String MESSAGE_ERR_UPDATING_SHIFT = "Lỗi khi cập nhật ca làm việc";
    public static final String MESSAGE_ERR_DELETING_SHIFT = "Lỗi khi xóa ca làm việc";
    public static final String MESSAGE_ERR_RESTORING_SHIFT = "Lỗi khi khôi phục ca làm việc";
    public static final String MESSAGE_ERR_ASSIGNING_SHIFT = "Lỗi khi phân công ca làm việc";
    public static final String MESSAGE_ERR_SHIFT_ALREADY_ASSIGNED = "Ca làm việc đã được phân công";
    public static final String MESSAGE_ERR_SHIFT_NOT_PENDING = "Ca làm việc không ở trạng thái chờ phân công";
    
    // Message Success - Availability
    public static final String MESSAGE_SUCCESS_CHECKING_AVAILABILITY = "Kiểm tra khả dụng kỹ thuật viên thành công";
    public static final String MESSAGE_SUCCESS_GET_AVAILABLE_TECHNICIANS = "Lấy danh sách kỹ thuật viên available thành công";
    
    // Messages - Technician availability reasons
    public static final String MESSAGE_TECHNICIAN_NOT_FOUND = "Kỹ thuật viên không tồn tại";
    public static final String MESSAGE_TECHNICIAN_NOT_AVAILABLE = "Đang có ca làm việc khác";
    
    // API Endpoints
    public static final String SHIFT_BASE_URL = "/shift";
    public static final String SHIFT_GET_BY_ID = "/{id}";
    public static final String SHIFT_GET_TYPES = "/types";
    public static final String SHIFT_GET_STATUSES = "/statuses";
    public static final String SHIFT_SEARCH = "/search";
    public static final String SHIFT_GET_BY_APPOINTMENT = "/appointment/{appointmentId}";
    public static final String SHIFT_SEARCH_FOR_TECHNICIAN = "/technician/search/{technician_id}";
    public static final String SHIFT_CREATE = "";
    public static final String SHIFT_UPDATE = "/{id}";
    public static final String SHIFT_UPDATE_STATUS = "/status/{id}";
    public static final String SHIFT_DELETE = "/{id}";
    public static final String SHIFT_RESTORE = "/restore/{id}";
    public static final String SHIFT_ASSIGN = "/{id}/assign";
    public static final String SHIFT_CHECK_AVAILABILITY = "/check-availability";
    public static final String SHIFT_GET_AVAILABLE_TECHNICIANS = "/available-technicians";
    
    // Additional log and exception messages
    public static final String LOG_INFO_SHOWING_SHIFT_LIST_FOR_TECHNICIAN = "Showing shift list for technician: {}";
    public static final String LOG_WARN_CANNOT_UPDATE_SHIFT_COMPLETED_OR_CANCELLED = "Cannot update shift that is already COMPLETED or CANCELLED: {}";
    public static final String MESSAGE_ERR_CANNOT_UPDATE_SHIFT_COMPLETED_OR_CANCELLED = "Không thể cập nhật ca làm việc đã hoàn thành hoặc đã hủy";
    public static final String LOG_WARN_CANNOT_TRANSITION_TO_IN_PROGRESS = "Cannot transition to IN_PROGRESS from status: {}";
    public static final String MESSAGE_ERR_CAN_ONLY_START_FROM_SCHEDULED = "Chỉ có thể bắt đầu ca làm việc từ trạng thái SCHEDULED (Đã lên lịch)";
    public static final String LOG_INFO_AUTO_UPDATED_APPOINTMENT_TO_IN_PROGRESS = "✅ Auto-updated appointment {} to IN_PROGRESS when shift {} started";
    public static final String LOG_WARN_FAILED_AUTO_UPDATE_APPOINTMENT = "⚠️ Failed to auto-update appointment to IN_PROGRESS when shift started: {}";
    public static final String LOG_WARN_CANNOT_TRANSITION_BACKWARD = "Cannot transition backward from IN_PROGRESS to {}";
    public static final String MESSAGE_ERR_CANNOT_TRANSITION_BACKWARD = "Không thể quay ngược trạng thái từ Đang thực hiện";
    public static final String LOG_INFO_SHIFT_STATUS_UPDATED = "Shift {} status updated from {} to {}";
    public static final String LOG_WARN_INVALID_SHIFT_STATUS = "Invalid shift status: {}";
    public static final String MESSAGE_ERR_INVALID_SHIFT_STATUS = "Trạng thái không hợp lệ: %s";
    
    // Validation messages
    public static final String LOG_ERR_STAFF_REQUIRED = "Staff is required for shift";
    public static final String MESSAGE_ERR_STAFF_REQUIRED = "Ca làm việc phải có ít nhất một nhân viên";
    public static final String LOG_ERR_TECHNICIAN_REQUIRED = "Technician is required for shift";
    public static final String MESSAGE_ERR_TECHNICIAN_REQUIRED = "Ca làm việc phải có ít nhất một kỹ thuật viên";
}



