package com.fpt.evcare.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DashboardChartsResponse {
    List<MonthlyAppointmentChartResponse> appointmentTrend;      // Xu hướng lịch hẹn
    List<ServiceTypeChartResponse> serviceTypeDistribution;      // Phân bố loại dịch vụ
    List<MonthlyRevenueChartResponse> monthlyRevenue;            // Doanh thu hàng tháng
}


