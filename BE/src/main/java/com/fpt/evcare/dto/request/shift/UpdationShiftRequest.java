package com.fpt.evcare.dto.request.shift;

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
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdationShiftRequest implements Serializable {

    UUID staffId;

    List<UUID> technicianIds;

    UUID assigneeId;

    UUID appointmentId;

    ShiftTypeEnum shiftType;

    LocalDateTime startTime;

    LocalDateTime endTime;

    ShiftStatusEnum status;

    BigDecimal totalHours;

    String notes;
}

