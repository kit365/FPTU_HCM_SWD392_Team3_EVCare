package com.fpt.evcare.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WarrantyEligibilityResponse implements Serializable {
    
    Boolean hasWarrantyEligibleAppointments; // Có appointment trong danh sách bảo hành không
    
    Integer totalWarrantyEligibleAppointments; // Tổng số appointment bảo hành
    
    List<WarrantyAppointmentSummary> warrantyAppointments; // Danh sách các appointment bảo hành
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WarrantyAppointmentSummary implements Serializable {
        UUID appointmentId;
        String customerFullName;
        String customerEmail;
        String customerPhoneNumber;
        String vehicleNumberPlate;
        String scheduledAt;
        List<String> serviceNames; // Danh sách tên dịch vụ
    }
}

