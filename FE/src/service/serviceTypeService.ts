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

  // Get service type detail by service type ID
  getById: async (id: string): Promise<ServiceTypeResponse> => {
    const response = await apiClient.get<ApiResponse<ServiceTypeResponse>>(`/service-type/${id}`);
    return response.data.data;
  },

  // Get services by vehicle type ID with pagination
  getByVehicleTypeId: async (vehicleTypeId: string, params?: { page?: number; pageSize?: number; keyword?: string; isActive?: boolean }) => {
    // Build query params with defaults
    const queryParams: Record<string, string> = {
      page: String(params?.page ?? 0),
      pageSize: String(params?.pageSize ?? 10),
    };
    
    if (params?.keyword) {
      queryParams.keyword = params.keyword;
    }
    
    // Chỉ thêm isActive nếu có giá trị cụ thể (true/false)
    if (params?.isActive !== undefined) {
      queryParams.isActive = String(params.isActive);
    }
    
    const query = new URLSearchParams(queryParams).toString();
    
    const response = await apiClient.get<ApiResponse<any>>(`/service-type/vehicle_type/${vehicleTypeId}?${query}`);
    // Trả về TOÀN BỘ response.data (có cả data, page, size, totalPages, totalElements)
    return response.data.data;
  },

  // Get parent services by vehicle type ID (for dropdown)
  getParentsByVehicleTypeId: async (vehicleTypeId: string): Promise<ServiceTypeResponse[]> => {
    const response = await apiClient.get<ApiResponse<ServiceTypeResponse[]>>(`/service-type/parent-services/service-type/${vehicleTypeId}`);
    return response.data.data;
  },

  // Get children services by parent ID and vehicle type ID (for dropdown)
  getChildrenByParentAndVehicleType: async (parentId: string, vehicleTypeId: string): Promise<ServiceTypeResponse[]> => {
    const response = await apiClient.get<ApiResponse<ServiceTypeResponse[]>>(`/service-type/parent-services/${parentId}/vehicle-types/${vehicleTypeId}/service-types/`);
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
