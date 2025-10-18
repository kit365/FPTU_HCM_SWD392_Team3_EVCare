package com.fpt.evcare.dto.request.appointment;

import jakarta.validation.constraints.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdationAppointmentRequest {

    UUID customerId;

    @NotBlank(message = "Họ & tên không được để trống")
    String customerFullName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "\\d{10}|^$", message = "Số điện thoại phải là 10 chữ số")
    String customerPhoneNumber;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    String customerEmail;

    List<UUID> technicianId;

    UUID assigneeId;

    @NotNull(message = "Loại xe không được để trống")
    UUID vehicleTypeId;

    @NotNull(message = "Biển số không được để trống")
    String vehicleNumberPlate;

    @NotNull(message = "Số Km không được để trống")
    String vehicleKmDistances;

    String userAddress;

    String serviceMode;

    String status;

    LocalDateTime scheduledAt;

    String notes;

    boolean isActive;

    boolean isDeleted;

    String createdBy;

    String updatedBy;

    @NotNull(message = "Loại dịch vụ không được để trống")
    List<UUID> serviceTypeIds;
}
