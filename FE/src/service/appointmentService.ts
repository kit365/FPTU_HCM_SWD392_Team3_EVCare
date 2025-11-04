import { apiClient } from './api';
import type {
  AppointmentResponse,
  AppointmentSearchRequest,
  AppointmentApiResponse,
  AppointmentListApiResponse
} from '../types/appointment.types';
import type { MaintenanceManagementSummary } from '../types/invoice.types';
import type { ApiResponse } from '../types/api';

// Appointment Service
export const appointmentService = {
  // Search with pagination and filters - GET /api/v1/appointment/
  search: async (params: AppointmentSearchRequest) => {
    const queryParams = new URLSearchParams({
      page: String(params.page),
      pageSize: String(params.pageSize),
      ...(params.keyword ? { keyword: params.keyword } : {}),
      ...(params.status ? { status: params.status } : {}),
      ...(params.serviceMode ? { serviceMode: params.serviceMode } : {}),
      ...(params.fromDate ? { fromDate: params.fromDate } : {}),
      ...(params.toDate ? { toDate: params.toDate } : {}),
    }).toString();
    
    const response = await apiClient.get<AppointmentListApiResponse>(
      `/appointment/?${queryParams}`
    );
    console.log("GET APPOINTMENTS RESPONSE:", response);
    return response;
  },

  // Get by id - GET /api/v1/appointment/{id}
  getById: async (id: string): Promise<AppointmentResponse> => {
    const response = await apiClient.get<AppointmentApiResponse>(
      `/appointment/${id}`
    );
    console.log("GET APPOINTMENT BY ID RESPONSE:", response);
    return response.data.data;
  },

  // Update status - PATCH /api/v1/appointment/status/{id}
  updateStatus: async (id: string, status: string) => {
    const response = await apiClient.patch(
      `/appointment/status/${id}`,
      status,
      {
        headers: {
          'Content-Type': 'text/plain'
        }
      }
    );
    console.log("UPDATE APPOINTMENT STATUS RESPONSE:", response);
    return response.data;
  },

  // Search warranty appointments - GET /api/v1/appointment/warranty
  searchWarranty: async (params: { page: number; pageSize: number; keyword?: string }) => {
    const queryParams = new URLSearchParams({
      page: String(params.page),
      pageSize: String(params.pageSize),
      ...(params.keyword ? { keyword: params.keyword } : {}),
    }).toString();
    
    const response = await apiClient.get<AppointmentListApiResponse>(
      `/appointment/warranty?${queryParams}`
    );
    console.log("GET WARRANTY APPOINTMENTS RESPONSE:", response);
    return response;
  },

  // Get maintenance details - GET /api/v1/appointment/{id}/maintenance-details
  getMaintenanceDetails: async (id: string): Promise<MaintenanceManagementSummary[]> => {
    const response = await apiClient.get<ApiResponse<MaintenanceManagementSummary[]>>(
      `/appointment/${id}/maintenance-details`
    );
    console.log("GET MAINTENANCE DETAILS RESPONSE:", response);
    return response.data.data;
  }
};

