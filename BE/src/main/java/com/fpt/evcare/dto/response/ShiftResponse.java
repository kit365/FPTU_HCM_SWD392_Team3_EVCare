package com.fpt.evcare.dto.response;

import com.fpt.evcare.enums.ShiftStatusEnum;
import com.fpt.evcare.enums.ShiftTypeEnum;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ShiftResponse implements Serializable {

    UUID shiftId;

    UserResponse staff;

    List<UserResponse> technicians;

    UserResponse assignee;

    AppointmentResponse appointment;

    ShiftTypeEnum shiftType;

    LocalDateTime startTime;

    LocalDateTime endTime;

    ShiftStatusEnum status;

    BigDecimal totalHours;

    String notes;

    String search;

    Boolean isActive;

    Boolean isDeleted;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;

    String createdBy;

    String updatedBy;
}

