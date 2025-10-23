import { apiClient } from './api';
import type { ApiResponse } from '../types/api';
import type {
  VehiclePartCategoryResponse,
  CreationVehiclePartCategoryRequest,
  UpdationVehiclePartCategoryRequest,
  VehiclePartCategoryApiResponse,
  VehiclePartCategoryListApiResponse
} from '../types/vehicle-part-category.types';

// Vehicle Part Category Service
// Align with BE VehiclePartCategoryController endpoints
export const vehiclePartCategoryService = {
  // Search with pagination
  search: async (params: { page: number; pageSize: number; keyword?: string }) => {
    const query = new URLSearchParams({
      page: String(params.page),
      pageSize: String(params.pageSize),
      ...(params.keyword ? { keyword: params.keyword } : {}),
    }).toString();
    
    const response = await apiClient.get<ApiResponse<{
      data: VehiclePartCategoryResponse[];
      totalPages: number;
      totalElements: number;
    }>>(`/part-category/?${query}`);
    return response.data.data;
  },

  // Get all vehicle part categories (for dropdown)
  getAll: async (): Promise<VehiclePartCategoryResponse[]> => {
    const response = await apiClient.get<VehiclePartCategoryListApiResponse>('/part-category/');
    return response.data.data;
  },

  // Get by id
  getById: async (id: string): Promise<VehiclePartCategoryResponse> => {
    const response = await apiClient.get<VehiclePartCategoryApiResponse>(`/part-category/${id}`);
    return response.data.data;
  },

  // Create
  create: async (data: CreationVehiclePartCategoryRequest): Promise<boolean> => {
    const response = await apiClient.post<ApiResponse<string>>('/part-category/', data);
    return Boolean(response.data?.success);
  },

  // Update
  update: async (id: string, data: UpdationVehiclePartCategoryRequest): Promise<boolean> => {
    const response = await apiClient.patch<ApiResponse<string>>(`/part-category/${id}`, data);
    return Boolean(response.data?.success);
  },

  // Delete
  remove: async (id: string): Promise<boolean> => {
    const response = await apiClient.delete<ApiResponse<string>>(`/part-category/${id}`);
    return Boolean(response.data?.success);
  },

  // Restore
  restore: async (id: string): Promise<boolean> => {
    const response = await apiClient.patch<ApiResponse<string>>(`/part-category/restore/${id}`);
    return Boolean(response.data?.success);
  }
};
