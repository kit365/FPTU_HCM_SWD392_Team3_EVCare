import type { ApiResponse } from '../types/api';
import type {
    VehiclePartResponse
} from '../types/service-type-vehicle-part.types';
import { apiClient } from './api';

// Vehicle Part Service - quản lý phụ tùng
// Align with BE VehiclePartController endpoints:
// BASE: /v1/api/vehicle-part
// GET /{id}, POST /, PATCH /{id}, DELETE /{id}, PATCH /restore/{id}
// GET /?page=0&pageSize=10&keyword= (search with pagination)
export const vehiclePartService = {
  // Search with pagination
  search: async (params: { page: number; pageSize: number; keyword?: string }) => {
    const query = new URLSearchParams({
      page: String(params.page),
      pageSize: String(params.pageSize),
      ...(params.keyword ? { keyword: params.keyword } : {}),
    }).toString();
    
    const response = await apiClient.get<ApiResponse<{
      data: VehiclePartResponse[];
      totalPages: number;
      totalElements: number;
    }>>(`/vehicle-part/?${query}`);
    return response.data.data;
  },

  getById: async (id: string): Promise<VehiclePartResponse> => {
    console.log('Calling getById with id:', id);
    const response = await apiClient.get<ApiResponse<VehiclePartResponse>>(`/vehicle-part/${id}`);
    console.log('getById response:', response);
    return response.data.data;
  },

  create: async (data: any): Promise<boolean> => {
    const response = await apiClient.post<ApiResponse<string>>(`/vehicle-part/`, data);
    return Boolean(response.data?.success);
  },

  update: async (id: string, data: any): Promise<boolean> => {
    const response = await apiClient.patch<ApiResponse<string>>(`/vehicle-part/${id}`, data);
    return Boolean(response.data?.success);
  },

  remove: async (id: string): Promise<boolean> => {
    const response = await apiClient.delete<ApiResponse<string>>(`/vehicle-part/${id}`);
    return Boolean(response.data?.success);
  },

  restore: async (id: string): Promise<boolean> => {
    const response = await apiClient.patch<ApiResponse<string>>(`/vehicle-part/restore/${id}`);
    return Boolean(response.data?.success);
  }
};