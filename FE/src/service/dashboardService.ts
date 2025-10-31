import { apiClient } from './api';
import type { ApiResponse } from '../types/api';
import type { DashboardStatsResponse, DashboardChartsResponse } from '../types/dashboard.types';

export const dashboardService = {
  // Get dashboard statistics
  getStats: async (): Promise<DashboardStatsResponse> => {
    const response = await apiClient.get<ApiResponse<DashboardStatsResponse>>('/dashboard/stats');
    
    if (!response.data?.success || !response.data?.data) {
      throw new Error(response.data?.message || 'Không thể lấy thống kê dashboard');
    }
    
    return response.data.data;
  },

  // Get dashboard chart data
  getChartData: async (): Promise<DashboardChartsResponse> => {
    const response = await apiClient.get<ApiResponse<DashboardChartsResponse>>('/dashboard/charts');
    
    if (!response.data?.success || !response.data?.data) {
      throw new Error(response.data?.message || 'Không thể lấy dữ liệu biểu đồ');
    }
    
    return response.data.data;
  },
};

