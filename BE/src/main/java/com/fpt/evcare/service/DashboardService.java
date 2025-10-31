package com.fpt.evcare.service;

import com.fpt.evcare.dto.response.DashboardChartsResponse;
import com.fpt.evcare.dto.response.DashboardStatsResponse;

public interface DashboardService {
    
    /**
     * Get dashboard statistics overview
     * @return DashboardStatsResponse containing all statistics
     */
    DashboardStatsResponse getDashboardStats();
    
    /**
     * Get dashboard chart data
     * @return DashboardChartsResponse containing chart data
     */
    DashboardChartsResponse getChartData();
}

