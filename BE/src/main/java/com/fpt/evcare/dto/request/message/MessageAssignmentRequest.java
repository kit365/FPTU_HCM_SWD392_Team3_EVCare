package com.fpt.evcare.dto.request.message;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageAssignmentRequest {
    
    /**
     * ID của customer cần phân công
     */
    @NotNull(message = "ID customer không được để trống")
    UUID customerId;
    
    /**
     * ID của staff được phân công
     */
    @NotNull(message = "ID staff không được để trống")
    UUID staffId;
    
    /**
     * Ghi chú
     */
    String notes;
}

