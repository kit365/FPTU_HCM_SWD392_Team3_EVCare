export interface DashboardStatsResponse {
  // User statistics
  totalCustomers: number;
  totalStaff: number;
  totalTechnicians: number;
  activeCustomers: number;
  
  // Vehicle statistics
  totalVehicles: number;
  activeVehicles: number;
  
  // Appointment statistics
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  
  // Monthly statistics
  appointmentsThisMonth: number;
  appointmentsLastMonth: number;
  monthlyRevenue: number;
  
  // Growth rates
  customerGrowthRate: number;
  appointmentGrowthRate: number;
}

// Chart data types
export interface MonthlyAppointmentChart {
  month: string;  // "T1", "T2", ...
  count: number;
}

export interface ServiceTypeChart {
  id: string;
  label: string;
  value: number;
}

export interface MonthlyRevenueChart {
  month: string;  // "T1", "T2", ...
  revenue: number; // Doanh thu (triệu VNĐ)
}

export interface DashboardChartsResponse {
  appointmentTrend: MonthlyAppointmentChart[];
  serviceTypeDistribution: ServiceTypeChart[];
  monthlyRevenue: MonthlyRevenueChart[];
}

