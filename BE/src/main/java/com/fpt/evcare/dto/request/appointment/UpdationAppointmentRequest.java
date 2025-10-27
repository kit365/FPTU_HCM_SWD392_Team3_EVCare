package com.fpt.evcare.dto.request.appointment;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdationAppointmentRequest {

    List<UUID> technicianId;

    UUID assigneeId;

    boolean isActive;

    boolean isDeleted;

    String updatedBy;
}
