import { apiClient } from './api';
import type { ApiResponse } from '../types/api';
import type {
  VehiclePartResponse,
  CreationVehiclePartRequest,
  UpdationVehiclePartRequest,
  VehiclePartSearchRequest,
  VehiclePartApiResponse,
  VehiclePartListApiResponse
} from '../types/vehicle-part.types';

// Vehicle Part Service
// Align with BE VehiclePartController endpoints
export const vehiclePartService = {
  // Search with pagination
  search: async (params: VehiclePartSearchRequest) => {
    const query = new URLSearchParams({
      page: String(params.page),
      pageSize: String(params.pageSize),
      ...(params.keyword ? { keyword: params.keyword } : {}),
      ...(params.vehicleTypeId ? { vehicleTypeId: params.vehicleTypeId } : {}),
      ...(params.vehiclePartCategoryId ? { vehiclePartCategoryId: params.vehiclePartCategoryId } : {}),
      ...(params.status ? { status: params.status } : {}),
    }).toString();
    
    const response = await apiClient.get<ApiResponse<{
      data: VehiclePartResponse[];
      totalPages: number;
      totalElements: number;
    }>>(`/vehicle-part/?${query}`);
    return response;
  },

  // Get all vehicle parts (for dropdown)
  getAll: async (): Promise<VehiclePartResponse[]> => {
    const response = await apiClient.get<VehiclePartListApiResponse>('/vehicle-part/');
    return response.data.data.data;
  },

  // Get vehicle parts by vehicle type ID
  getByVehicleTypeId: async (vehicleTypeId: string): Promise<VehiclePartResponse[]> => {
    const response = await apiClient.get<ApiResponse<VehiclePartResponse[]>>(`/vehicle-part/vehicle-type/${vehicleTypeId}`);
    return response.data.data;
  },

  // Get by id
  getById: async (id: string): Promise<VehiclePartResponse> => {
    const response = await apiClient.get<VehiclePartApiResponse>(`/vehicle-part/${id}`);
    return response.data.data;
  },

  // Create
  create: async (data: CreationVehiclePartRequest): Promise<boolean> => {
    const response = await apiClient.post<ApiResponse<string>>('/vehicle-part/', data);
    return Boolean(response.data?.success);
  },

  // Update
  update: async (id: string, data: UpdationVehiclePartRequest): Promise<boolean> => {
    const response = await apiClient.patch<ApiResponse<string>>(`/vehicle-part/${id}`, data);
    return Boolean(response.data?.success);
  },

  // Delete
  remove: async (id: string): Promise<boolean> => {
    const response = await apiClient.delete<ApiResponse<string>>(`/vehicle-part/${id}`);
    return Boolean(response.data?.success);
  },

  // Restore
  restore: async (id: string): Promise<boolean> => {
    const response = await apiClient.patch<ApiResponse<string>>(`/vehicle-part/restore/${id}`);
    return Boolean(response.data?.success);
  }
};
