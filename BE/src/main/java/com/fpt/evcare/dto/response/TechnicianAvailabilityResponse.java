package com.fpt.evcare.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TechnicianAvailabilityResponse implements Serializable {
    
    UUID technicianId;
    
    String technicianName;
    
    boolean isAvailable;
    
    String reason; // Lý do không available (nếu có)
    
    UUID conflictShiftId; // ID shift đang trùng (nếu có)
    
    LocalDateTime conflictStartTime;
    
    LocalDateTime conflictEndTime;
}

