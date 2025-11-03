import { apiClient } from './api';
import type { ApiResponse } from '../types/api';
import type {
  EmployeeProfileResponse,
  CreationEmployeeProfileRequest,
  UpdationEmployeeProfileRequest,
  EmployeeProfileSearchParams,
} from '../types/employee-profile.types';
import type { PageResponse } from '../types/pageResponse.types';

const API_BASE = "/employee-profile";

export const employeeProfileService = {
  // Create new employee profile
  create: async (data: CreationEmployeeProfileRequest): Promise<boolean> => {
    const response = await apiClient.post<ApiResponse<string>>(
      `${API_BASE}/`,
      data
    );
    
    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Tạo hồ sơ nhân viên thất bại');
      (error as any).response = { data: response.data };
      throw error;
    }
    
    return true;
  },

  // Get by ID
  getById: async (employeeProfileId: string): Promise<EmployeeProfileResponse> => {
    const response = await apiClient.get<ApiResponse<EmployeeProfileResponse>>(
      `${API_BASE}/${employeeProfileId}`
    );
    return response.data.data;
  },

  // Get by User ID
  getByUserId: async (userId: string): Promise<EmployeeProfileResponse | null> => {
    try {
      const response = await apiClient.get<ApiResponse<EmployeeProfileResponse>>(
        `${API_BASE}/user/${userId}`
      );
      return response.data.data;
    } catch (error: any) {
      // Return null if not found (404 or other errors)
      if (error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },


  // Search with pagination
  search: async (params: EmployeeProfileSearchParams, forceRefresh?: boolean) => {
    const queryParams: Record<string, string> = {
      page: String(params.page),
      size: String(params.size),
      ...(params.keyword ? { keyword: params.keyword } : {}),
    };
    
    // Add cache busting timestamp if force refresh
    if (forceRefresh) {
      queryParams._t = String(Date.now());
    }
    
    const query = new URLSearchParams(queryParams).toString();
    
    const response = await apiClient.get<ApiResponse<PageResponse<EmployeeProfileResponse>>>(
      `${API_BASE}/?${query}`
    );
    return response.data;
  },

  // Update employee profile
  update: async (
    employeeProfileId: string,
    data: UpdationEmployeeProfileRequest
  ): Promise<boolean> => {
    const response = await apiClient.patch<ApiResponse<string>>(
      `${API_BASE}/${employeeProfileId}`,
      data
    );
    
    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Cập nhật hồ sơ nhân viên thất bại');
      (error as any).response = { data: response.data };
      throw error;
    }
    
    return true;
  },

  // Delete (soft delete)
  remove: async (employeeProfileId: string): Promise<boolean> => {
    const response = await apiClient.delete<ApiResponse<string>>(
      `${API_BASE}/${employeeProfileId}`
    );
    
    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Xóa hồ sơ nhân viên thất bại');
      (error as any).response = { data: response.data };
      throw error;
    }
    
    return true;
  },

  // Restore deleted employee profile
  restore: async (employeeProfileId: string): Promise<boolean> => {
    const response = await apiClient.patch<ApiResponse<string>>(
      `${API_BASE}/restore/${employeeProfileId}`
    );
    
    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Khôi phục hồ sơ nhân viên thất bại');
      (error as any).response = { data: response.data };
      throw error;
    }
    
    return true;
  },
};

