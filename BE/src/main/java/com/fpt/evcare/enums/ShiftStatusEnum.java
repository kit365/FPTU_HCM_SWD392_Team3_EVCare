package com.fpt.evcare.enums;

public enum ShiftStatusEnum {
    PENDING_ASSIGNMENT,  // Chưa phân công (auto-created from appointment)
    LATE_ASSIGNMENT,     // Quá giờ chưa phân công
    SCHEDULED,           // Đã phân công, chưa bắt đầu
    IN_PROGRESS,         // Đang thực hiện
    COMPLETED,           // Hoàn thành
    CANCELLED            // Đã hủy
}

