package com.fpt.evcare.dto.response;


import com.fasterxml.jackson.annotation.JsonInclude;
import com.fpt.evcare.enums.AppointmentStatusEnum;
import com.fpt.evcare.enums.ServiceModeEnum;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder
public class AppointmentResponse implements Serializable {

    UUID appointmentId;

    UserResponse customer;

    String customerFullName;

    String customerPhoneNumber;

    String customerEmail;

    UserResponse assignee;

    transient List<UserResponse> technicianResponses;

    ServiceModeEnum serviceMode;

    AppointmentStatusEnum status;

    VehicleTypeResponse vehicleTypeResponse;

    String vehicleNumberPlate;

    String vehicleKmDistances;

    String userAddress;

    LocalDateTime scheduledAt;

    BigDecimal quotePrice;

    String notes;

    transient List<ServiceTypeResponse> serviceTypeResponses;

    Boolean isWarrantyAppointment;

    Boolean isActive;

    Boolean isDeleted;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;

    String createdBy;

    String updatedBy;
}
