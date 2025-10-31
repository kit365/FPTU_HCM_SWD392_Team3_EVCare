import { apiClient } from './api';
import type { ApiResponse } from '../types/api';
import type {
  VehicleProfileResponse,
  CreationVehicleProfileRequest,
  UpdationVehicleProfileRequest,
  VehicleProfileSearchParams
} from '../types/vehicle-profile.types';

// Vehicle Profile Service
// Align with BE VehicleController endpoints: /api/v1/vehicle
export const vehicleProfileService = {
  // Search/List with pagination and filters
  search: async (params: VehicleProfileSearchParams) => {
    const query = new URLSearchParams({
      page: String(params.page),
      size: String(params.size),
      ...(params.keyword ? { keyword: params.keyword } : {}),
      ...(params.vehicleTypeId ? { vehicleTypeId: params.vehicleTypeId } : {}),
    }).toString();
    
    const response = await apiClient.get<ApiResponse<{
      data: VehicleProfileResponse[];
      page: number;
      totalPages: number;
      totalElements: number;
    }>>(`/vehicle-profile/?${query}`);
    return response.data;
  },

  // Get by ID
  getById: async (vehicleId: string): Promise<VehicleProfileResponse> => {
    const response = await apiClient.get<ApiResponse<VehicleProfileResponse>>(
      `/vehicle-profile/${vehicleId}`
    );
    return response.data.data;
  },

  // Get by User ID
  getByUserId: async (userId: string): Promise<VehicleProfileResponse[]> => {
    const response = await apiClient.get<ApiResponse<VehicleProfileResponse[]>>(
      `/vehicle-profile/user/${userId}`
    );
    return response.data.data;
  },

  // Create new vehicle profile
  create: async (data: CreationVehicleProfileRequest): Promise<string> => {
    const response = await apiClient.post<ApiResponse<string>>('/vehicle-profile/', data);
    return response.data.data;
  },

  // Update vehicle profile
  update: async (vehicleId: string, data: UpdationVehicleProfileRequest): Promise<VehicleProfileResponse> => {
    const response = await apiClient.patch<ApiResponse<VehicleProfileResponse>>(
      `/vehicle-profile/${vehicleId}`,
      data
    );
    return response.data.data;
  },

  // Delete (soft delete)
  remove: async (vehicleId: string): Promise<boolean> => {
    const response = await apiClient.delete<ApiResponse<string>>(
      `/vehicle-profile/${vehicleId}`
    );
    return Boolean(response.data?.success);
  },

  // Restore deleted vehicle
  restore: async (vehicleId: string): Promise<boolean> => {
    const response = await apiClient.patch<ApiResponse<string>>(
      `/vehicle-profile/restore/${vehicleId}`
    );
    return Boolean(response.data?.success);
  }
};

