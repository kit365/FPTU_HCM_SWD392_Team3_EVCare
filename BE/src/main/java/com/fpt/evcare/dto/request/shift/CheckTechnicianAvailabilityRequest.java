package com.fpt.evcare.dto.request.shift;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CheckTechnicianAvailabilityRequest implements Serializable {
    
    List<UUID> technicianIds;
    
    LocalDateTime startTime;
    
    LocalDateTime endTime;
    
    UUID excludeShiftId; // Khi edit, loại trừ shift hiện tại
}

