package com.fpt.evcare.dto.request.appointment;

import com.fpt.evcare.enums.AppointmentStatusEnum;
import com.fpt.evcare.enums.ServiceModeEnum;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreationAppointmentRequest {

    UUID customerId;

    @NotBlank(message = "Họ & tên không được để trống")
    String customerFullName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "\\d{10}|^$", message = "Số điện thoại phải là 10 chữ số")
    String customerPhoneNumber;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    String customerEmail;

    UUID technicianId;

    UUID assigneeId;

    String userAddress;

    @Enumerated(EnumType.STRING)
    ServiceModeEnum serviceMode;

    @Enumerated(EnumType.STRING)
    AppointmentStatusEnum status;

    LocalDateTime scheduledAt;

    String notes;

    @NotNull(message = "Loại dịch vụ không được để trống")
    List<UUID> serviceTypeIds;
}
