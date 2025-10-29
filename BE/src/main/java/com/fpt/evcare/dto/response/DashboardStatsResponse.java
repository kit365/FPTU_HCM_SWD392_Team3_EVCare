package com.fpt.evcare.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DashboardStatsResponse {
    
    // User statistics
    Long totalCustomers;
    Long totalStaff;
    Long totalTechnicians;
    Long activeCustomers;
    
    // Vehicle statistics
    Long totalVehicles;
    Long activeVehicles;
    
    // Appointment statistics
    Long totalAppointments;
    Long pendingAppointments;
    Long confirmedAppointments;
    Long completedAppointments;
    Long cancelledAppointments;
    
    // Monthly statistics
    Long appointmentsThisMonth;
    Long appointmentsLastMonth;
    Double monthlyRevenue;
    
    // Growth rates
    Double customerGrowthRate;
    Double appointmentGrowthRate;
}


