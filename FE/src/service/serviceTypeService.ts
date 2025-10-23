import type { ApiResponse } from '../types/api';
import type {
  ServiceTypeResponse,
  CreationServiceTypeRequest,
  UpdationServiceTypeRequest
} from '../types/service-type.types';
import { apiClient } from './api';

// ServiceType Service - quản lý loại dịch vụ
// Align with BE ServiceTypeController endpoints:
// BASE: /v1/api/service-type
// GET /{id}, POST /, PATCH /{id}, DELETE /{id}, PATCH /restore/{id}
// GET /?page=0&pageSize=10&keyword= (search with pagination)
export const serviceTypeService = {
  // Search with pagination
  search: async (params: { page: number; pageSize: number; keyword?: string }) => {
    const query = new URLSearchParams({
      page: String(params.page),
      pageSize: String(params.pageSize),
      ...(params.keyword ? { keyword: params.keyword } : {}),
    }).toString();
    
    const response = await apiClient.get<ApiResponse<{
      data: ServiceTypeResponse[];
      totalPages: number;
      totalElements: number;
    }>>(`/service-type/?${query}`);
    return response.data.data;
  },

  getById: async (id: string): Promise<ServiceTypeResponse> => {
    console.log('Calling getById with id:', id);
    const response = await apiClient.get<ApiResponse<ServiceTypeResponse>>(`/service-type/${id}`);
    console.log('getById response:', response);
    return response.data.data;
  },

  create: async (data: CreationServiceTypeRequest): Promise<boolean> => {
    const response = await apiClient.post<ApiResponse<string>>(`/service-type/`, data);
    return Boolean(response.data?.success);
  },

  update: async (id: string, data: UpdationServiceTypeRequest): Promise<boolean> => {
    const response = await apiClient.patch<ApiResponse<string>>(`/service-type/${id}`, data);
    return Boolean(response.data?.success);
  },

  remove: async (id: string): Promise<boolean> => {
    const response = await apiClient.delete<ApiResponse<string>>(`/service-type/${id}`);
    return Boolean(response.data?.success);
  },

  restore: async (id: string): Promise<boolean> => {
    const response = await apiClient.patch<ApiResponse<string>>(`/service-type/restore/${id}`);
    return Boolean(response.data?.success);
  }
};
