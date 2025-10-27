import type { ApiResponse } from '../types/api';
import type {
  ServiceTypeVehiclePartResponse,
  CreationServiceTypeVehiclePartRequest,
  UpdationServiceTypeVehiclePartRequest
} from '../types/service-type-vehicle-part.types';
import { apiClient } from './api';

// Service Type Vehicle Part Service - quản lý liên kết dịch vụ - phụ tùng
// Align with BE ServiceTypeVehiclePartController endpoints:
// BASE: /v1/api/service-type/vehicle-part (Note: có dấu / giữa service-type và vehicle-part)
// GET /{id}, POST /, PATCH /{id}, DELETE /{id}, PATCH /restore/{id}
// GET /service-type/{serviceTypeId} - get all parts by service type id
export const serviceTypeVehiclePartService = {
  getById: async (id: string): Promise<ServiceTypeVehiclePartResponse> => {
    const response = await apiClient.get<ApiResponse<ServiceTypeVehiclePartResponse>>(`/service-type/vehicle-part/${id}`);
    return response.data.data;
  },

  getByServiceTypeId: async (serviceTypeId: string): Promise<ServiceTypeVehiclePartResponse[]> => {
    const response = await apiClient.get<ApiResponse<ServiceTypeVehiclePartResponse[]>>(`/service-type/vehicle-part/service-type/${serviceTypeId}`);
    return response.data.data || [];
  },

  create: async (data: CreationServiceTypeVehiclePartRequest): Promise<boolean> => {
    const response = await apiClient.post<ApiResponse<string>>(`/service-type/vehicle-part/`, data);
    return Boolean(response.data?.success);
  },

  update: async (id: string, data: UpdationServiceTypeVehiclePartRequest): Promise<boolean> => {
    const response = await apiClient.patch<ApiResponse<string>>(`/service-type/vehicle-part/${id}`, data);
    return Boolean(response.data?.success);
  },

  remove: async (id: string): Promise<boolean> => {
    const response = await apiClient.delete<ApiResponse<string>>(`/service-type/vehicle-part/${id}`);
    return Boolean(response.data?.success);
  },

  restore: async (id: string): Promise<boolean> => {
    const response = await apiClient.patch<ApiResponse<string>>(`/service-type/vehicle-part/restore/${id}`);
    return Boolean(response.data?.success);
  }
};
