import { apiClient } from "./api";
import type { ApiResponse } from "../types/api";
import type { MaintenanceManagementResponse } from "../types/maintenance-management.types";

export const maintenanceManagementService = {
  // Get maintenance management by ID
  getById: async (id: string, params?: { page?: number; pageSize?: number; keyword?: string }) => {
    const query = new URLSearchParams({
      page: String(params?.page || 0),
      pageSize: String(params?.pageSize || 10),
      ...(params?.keyword ? { keyword: params.keyword } : {}),
    }).toString();

    const response = await apiClient.get<ApiResponse<MaintenanceManagementResponse>>(
      `/maintenance-management/${id}/?${query}`
    );
    console.log("GET MAINTENANCE MANAGEMENT BY ID RESPONSE:", response);
    return response.data.data;
  },

  // Update notes
  updateNotes: async (id: string, notes: string) => {
    const response = await apiClient.patch(
      `/maintenance-management/status/${id}`,
      notes,
      {
        headers: {
          'Content-Type': 'text/plain'
        }
      }
    );
    console.log("UPDATE MAINTENANCE NOTES RESPONSE:", response);
    return response.data;
  },

  // Update status
  updateStatus: async (id: string, status: string) => {
    const response = await apiClient.patch(
      `/maintenance-management/status/${id}/`,
      status,
      {
        headers: {
          'Content-Type': 'text/plain'
        }
      }
    );
    console.log("UPDATE MAINTENANCE STATUS RESPONSE:", response);
    return response.data;
  },

  // Get status list
  getStatusList: async () => {
    const response = await apiClient.get<ApiResponse<string[]>>(
      `/maintenance-management/status-list/`
    );
    console.log("GET MAINTENANCE STATUS LIST RESPONSE:", response);
    return response.data.data;
  },

  // Search maintenance management for technician with filters
  searchByTechnician: async (
    technicianId: string, 
    params?: { 
      page?: number; 
      pageSize?: number; 
      keyword?: string;
      date?: string;        // format: yyyy-MM-dd
      status?: string;      // PENDING, IN_PROGRESS, COMPLETED, CANCELLED
      appointmentId?: string;
    }
  ) => {
    const queryParams: Record<string, string> = {
      page: String(params?.page || 0),
      pageSize: String(params?.pageSize || 10),
    };

    if (params?.keyword) queryParams.keyword = params.keyword;
    if (params?.date) queryParams.date = params.date;
    if (params?.status) queryParams.status = params.status;
    if (params?.appointmentId) queryParams.appointmentId = params.appointmentId;

    const query = new URLSearchParams(queryParams).toString();

    const response = await apiClient.get<ApiResponse<{
      data: MaintenanceManagementResponse[];
      totalPages: number;
      totalElements: number;
      currentPage: number;
      pageSize: number;
    }>>(
      `/maintenance-management/technician/search/${technicianId}/?${query}`
    );
    console.log("SEARCH MAINTENANCE BY TECHNICIAN RESPONSE:", response);
    return response.data.data;
  },

  // Create maintenance management
  create: async (data: any) => {
    const response = await apiClient.post<ApiResponse<string>>(
      `/maintenance-management/`,
      data
    );
    console.log("CREATE MAINTENANCE MANAGEMENT RESPONSE:", response);
    return response.data;
  },

  // Delete maintenance management
  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<string>>(
      `/maintenance-management/${id}/`
    );
    console.log("DELETE MAINTENANCE MANAGEMENT RESPONSE:", response);
    return response.data;
  },
};
