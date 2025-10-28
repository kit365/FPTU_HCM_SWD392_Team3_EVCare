package com.fpt.evcare.enums;

public enum AppointmentStatusEnum {
    PENDING,
    CONFIRMED,
    IN_PROGRESS,
    PENDING_PAYMENT, // Đã hoàn thành bảo dưỡng, chờ thanh toán
    COMPLETED,
    CANCELLED,
}
