import { apiClient } from './api';
import type { ApiResponse } from '../types/api';
import type {
  WarrantyPartResponse,
  CreationWarrantyPartRequest,
  UpdationWarrantyPartRequest,
  WarrantyPartSearchRequest,
  WarrantyPartApiResponse,
  WarrantyPartListApiResponse
} from '../types/warranty-part.types';

// Warranty Part Service
// Align with BE WarrantyPartController endpoints
export const warrantyPartService = {
  // Search with pagination
  search: async (params: WarrantyPartSearchRequest) => {
    const query = new URLSearchParams({
      page: String(params.page),
      pageSize: String(params.pageSize),
      ...(params.keyword ? { keyword: params.keyword } : {}),
    }).toString();
    
    const response = await apiClient.get<ApiResponse<{
      data: WarrantyPartResponse[];
      totalPages: number;
      totalElements: number;
      page?: number;
      size?: number;
      last?: boolean;
    }>>(`/warranty-part/?${query}`);
    return response;
  },

  // Get by id
  getById: async (id: string): Promise<WarrantyPartResponse> => {
    const response = await apiClient.get<WarrantyPartApiResponse>(`/warranty-part/${id}`);
    return response.data.data;
  },

  // Get warranty parts by vehicle part ID
  getByVehiclePartId: async (vehiclePartId: string, page: number = 0, pageSize: number = 10): Promise<{
    data: WarrantyPartResponse[];
    totalPages: number;
    totalElements: number;
  }> => {
    const query = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    }).toString();
    const response = await apiClient.get<ApiResponse<{
      data: WarrantyPartResponse[];
      totalPages: number;
      totalElements: number;
    }>>(`/warranty-part/vehicle-part/${vehiclePartId}?${query}`);
    return response.data.data;
  },

  // Create
  create: async (data: CreationWarrantyPartRequest): Promise<boolean> => {
    const response = await apiClient.post<ApiResponse<string>>('/warranty-part/', data);
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Tạo bảo hành phụ tùng thất bại');
    }
    return Boolean(response.data?.success);
  },

  // Update
  update: async (id: string, data: UpdationWarrantyPartRequest): Promise<boolean> => {
    const response = await apiClient.patch<ApiResponse<string>>(`/warranty-part/${id}`, data);
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Cập nhật bảo hành phụ tùng thất bại');
    }
    return Boolean(response.data?.success);
  },

  // Delete
  remove: async (id: string): Promise<boolean> => {
    const response = await apiClient.delete<ApiResponse<string>>(`/warranty-part/${id}`);
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Xóa bảo hành phụ tùng thất bại');
    }
    return Boolean(response.data?.success);
  },

  // Restore
  restore: async (id: string): Promise<boolean> => {
    const response = await apiClient.patch<ApiResponse<string>>(`/warranty-part/restore/${id}`);
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Khôi phục bảo hành phụ tùng thất bại');
    }
    return Boolean(response.data?.success);
  }
};
