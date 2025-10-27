package com.fpt.evcare.dto.request.shift;

import com.fpt.evcare.enums.ShiftStatusEnum;
import com.fpt.evcare.enums.ShiftTypeEnum;
import jakarta.validation.constraints.NotNull;
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
public class CreationShiftRequest implements Serializable {

    UUID staffId;

    List<UUID> technicianIds;

    @NotNull(message = "ID người phụ trách không được để trống")
    UUID assigneeId;

    // OPTIONAL - cho shifts không liên quan appointment (ca trực, kiểm kê, bảo trì,...)
    UUID appointmentId;

    ShiftTypeEnum shiftType;

    @NotNull(message = "Thời gian bắt đầu không được để trống")
    LocalDateTime startTime;

    LocalDateTime endTime;

    ShiftStatusEnum status;

    BigDecimal totalHours;

    String notes;
}

