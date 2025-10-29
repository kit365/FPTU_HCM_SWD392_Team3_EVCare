package com.fpt.evcare.serviceimpl;

import com.fpt.evcare.dto.response.*;
import com.fpt.evcare.enums.RoleEnum;
import com.fpt.evcare.repository.AppointmentRepository;
import com.fpt.evcare.repository.PaymentTransactionRepository;
import com.fpt.evcare.repository.UserRepository;
import com.fpt.evcare.service.DashboardService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DashboardServiceImpl implements DashboardService {

    UserRepository userRepository;
    AppointmentRepository appointmentRepository;
    PaymentTransactionRepository paymentTransactionRepository;

    @Override
    public DashboardStatsResponse getDashboardStats() {
        log.info("Fetching dashboard statistics...");

        // Get current month date range
        YearMonth currentMonth = YearMonth.now();
        LocalDateTime startOfMonth = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime endOfMonth = currentMonth.atEndOfMonth().atTime(23, 59, 59);

        // Get last month date range
        YearMonth lastMonth = currentMonth.minusMonths(1);
        LocalDateTime startOfLastMonth = lastMonth.atDay(1).atStartOfDay();
        LocalDateTime endOfLastMonth = lastMonth.atEndOfMonth().atTime(23, 59, 59);

        // User statistics
        Long totalCustomers = userRepository.countByRoleRoleNameAndIsDeletedFalse(RoleEnum.CUSTOMER);
        Long totalStaff = userRepository.countByRoleRoleNameAndIsDeletedFalse(RoleEnum.STAFF);
        Long totalTechnicians = userRepository.countByRoleRoleNameAndIsDeletedFalse(RoleEnum.TECHNICIAN);
        Long activeCustomers = userRepository.countByRoleRoleNameAndIsActiveAndIsDeletedFalse(RoleEnum.CUSTOMER, true);

        // Vehicle statistics - count unique vehicles from appointments
        Long totalVehicles = appointmentRepository.countUniqueVehicles();
        // Long activeVehicles = vehicleRepository.countByStatusAndIsDeletedFalse("ACTIVE"); // TODO: Implement when status field exists

        // Appointment statistics
        Long totalAppointments = appointmentRepository.countTotalActiveAppointments();
        Long pendingAppointments = appointmentRepository.countByStatusAndIsDeletedFalseAndIsActiveTrue(
                com.fpt.evcare.enums.AppointmentStatusEnum.PENDING);
        Long confirmedAppointments = appointmentRepository.countByStatusAndIsDeletedFalseAndIsActiveTrue(
                com.fpt.evcare.enums.AppointmentStatusEnum.CONFIRMED);
        Long completedAppointments = appointmentRepository.countByStatusAndIsDeletedFalseAndIsActiveTrue(
                com.fpt.evcare.enums.AppointmentStatusEnum.COMPLETED);
        Long cancelledAppointments = appointmentRepository.countByStatusAndIsDeletedFalseAndIsActiveTrue(
                com.fpt.evcare.enums.AppointmentStatusEnum.CANCELLED);
        Long appointmentsThisMonth = appointmentRepository.countByScheduledAtBetweenAndIsDeletedFalseAndIsActiveTrue(
                startOfMonth, endOfMonth);
        Long appointmentsLastMonth = appointmentRepository.countByScheduledAtBetweenAndIsDeletedFalseAndIsActiveTrue(
                startOfLastMonth, endOfLastMonth);
        Double monthlyRevenue = paymentTransactionRepository.sumRevenueByDateRange(startOfMonth, endOfMonth);

        // Calculate growth rates
        Double customerGrowthRate = calculateGrowthRate(activeCustomers, totalCustomers);
        Double appointmentGrowthRate = calculateGrowthRate(appointmentsThisMonth, appointmentsLastMonth);

        log.info("Dashboard statistics fetched successfully. Total customers: {}, Total staff: {}, Total technicians: {}", 
                totalCustomers, totalStaff, totalTechnicians);

        return DashboardStatsResponse.builder()
                // User statistics
                .totalCustomers(totalCustomers)
                .totalStaff(totalStaff)
                .totalTechnicians(totalTechnicians)
                .activeCustomers(activeCustomers)
                // Vehicle statistics
                .totalVehicles(totalVehicles)
                .activeVehicles(totalVehicles) // Temporary: use total as active
                // Appointment statistics
                .totalAppointments(totalAppointments)
                .pendingAppointments(pendingAppointments)
                .confirmedAppointments(confirmedAppointments)
                .completedAppointments(completedAppointments)
                .cancelledAppointments(cancelledAppointments)
                .appointmentsThisMonth(appointmentsThisMonth)
                .appointmentsLastMonth(appointmentsLastMonth)
                .monthlyRevenue(monthlyRevenue)
                // Growth rates
                .customerGrowthRate(customerGrowthRate)
                .appointmentGrowthRate(appointmentGrowthRate)
                .build();
    }

    @Override
    public DashboardChartsResponse getChartData() {
        log.info("Fetching dashboard chart data...");

        // 1. Appointment trend by month (last 12 months)
        List<MonthlyAppointmentChartResponse> appointmentTrend = new ArrayList<>();
        List<Object[]> appointmentData = appointmentRepository.countAppointmentsByMonth();
        
        for (Object[] row : appointmentData) {
            Integer month = ((Number) row[0]).intValue(); // PostgreSQL EXTRACT returns BigDecimal
            Long count = ((Number) row[1]).longValue();
            appointmentTrend.add(MonthlyAppointmentChartResponse.builder()
                    .month("T" + month)
                    .count(count)
                    .build());
        }

        // 2. Service type distribution
        List<ServiceTypeChartResponse> serviceTypeDistribution = new ArrayList<>();
        List<Object[]> serviceTypeData = appointmentRepository.countAppointmentsByServiceType();
        
        for (Object[] row : serviceTypeData) {
            String serviceName = (String) row[0];
            Long count = ((Number) row[1]).longValue();
            serviceTypeDistribution.add(ServiceTypeChartResponse.builder()
                    .id(serviceName)
                    .label(serviceName)
                    .value(count)
                    .build());
        }

        // 3. Monthly revenue (last 6 months) - Always show 6 months, even if no data
        List<MonthlyRevenueChartResponse> monthlyRevenue = new ArrayList<>();
        List<Object[]> revenueData = paymentTransactionRepository.sumRevenueByMonth();
        
        // Create a map for quick lookup
        java.util.Map<Integer, Double> revenueMap = new java.util.HashMap<>();
        for (Object[] row : revenueData) {
            Integer month = ((Number) row[0]).intValue();
            BigDecimal revenue = (BigDecimal) row[1];
            Double revenueInMillion = revenue.doubleValue() / 1_000_000;
            revenueMap.put(month, revenueInMillion);
        }
        
        // Get last 6 months (including current month)
        java.time.YearMonth currentYearMonth = java.time.YearMonth.now();
        for (int i = 5; i >= 0; i--) {
            java.time.YearMonth targetMonth = currentYearMonth.minusMonths(i);
            int month = targetMonth.getMonthValue();
            
            // Get revenue from map, or 0 if no data
            Double revenue = revenueMap.getOrDefault(month, 0.0);
            
            monthlyRevenue.add(MonthlyRevenueChartResponse.builder()
                    .month("T" + month)
                    .revenue(revenue)
                    .build());
        }

        log.info("Dashboard chart data fetched successfully. Appointment trend: {} months, Service types: {}, Revenue data: {} months",
                appointmentTrend.size(), serviceTypeDistribution.size(), monthlyRevenue.size());

        return DashboardChartsResponse.builder()
                .appointmentTrend(appointmentTrend)
                .serviceTypeDistribution(serviceTypeDistribution)
                .monthlyRevenue(monthlyRevenue)
                .build();
    }

    /**
     * Calculate growth rate percentage
     * @param current Current period value
     * @param previous Previous period value
     * @return Growth rate as percentage (e.g., 15.5 for 15.5% growth)
     */
    private Double calculateGrowthRate(Long current, Long previous) {
        if (previous == null || previous == 0) {
            return current != null && current > 0 ? 100.0 : 0.0;
        }
        if (current == null) {
            return -100.0;
        }
        return ((current - previous) * 100.0) / previous;
    }
}

