package com.fpt.evcare.dto.request.shift;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignShiftRequest {
    
    @NotNull(message = "Người phụ trách chính là bắt buộc")
    private UUID assigneeId;
    
    private UUID staffId;  // Optional
    
    private List<UUID> technicianIds;  // Optional
    
    @NotNull(message = "Thời gian kết thúc là bắt buộc")
    private LocalDateTime endTime;  // Required - thời gian kết thúc dự kiến
}

