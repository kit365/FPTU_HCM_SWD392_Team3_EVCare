import { apiClient } from './api';
import type { ApiResponse } from '../types/api';
import type {
  UserResponse,
  CreationUserRequest,
  UpdationUserRequest,
  UserSearchParams
} from '../types/user.types';

// User Service
// Align with BE UserController endpoints: /api/v1/user
export const userService = {
  // Search/List with pagination
  search: async (params: UserSearchParams) => {
    const query = new URLSearchParams({
      page: String(params.page),
      pageSize: String(params.pageSize),
      ...(params.keyword ? { keyword: params.keyword } : {}),
    }).toString();
    
    const response = await apiClient.get<ApiResponse<{
      data: UserResponse[];
      page: number;
      totalPages: number;
      totalElements: number;
    }>>(`/user/?${query}`);
    return response.data;
  },

  // Get by ID
  getById: async (userId: string): Promise<UserResponse> => {
    const response = await apiClient.get<ApiResponse<UserResponse>>(
      `/user/${userId}`
    );
    return response.data.data;
  },

  // Create new user
  create: async (data: CreationUserRequest): Promise<boolean> => {
    const response = await apiClient.post<ApiResponse<string>>('/user/', data);
    
    // If backend returns success: false, throw error to trigger catch block
    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Tạo người dùng thất bại');
      (error as any).response = { data: response.data };
      throw error;
    }
    
    return true;
  },

  // Update user
  update: async (userId: string, data: UpdationUserRequest): Promise<boolean> => {
    const response = await apiClient.patch<ApiResponse<string>>(
      `/user/${userId}`,
      data
    );
    
    // If backend returns success: false, throw error to trigger catch block
    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Cập nhật người dùng thất bại');
      (error as any).response = { data: response.data };
      throw error;
    }
    
    return true;
  },

  // Delete (soft delete)
  remove: async (userId: string): Promise<boolean> => {
    const response = await apiClient.delete<ApiResponse<string>>(
      `/user/${userId}`
    );
    
    // If backend returns success: false, throw error to trigger catch block
    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Xóa người dùng thất bại');
      (error as any).response = { data: response.data };
      throw error;
    }
    
    return true;
  },

  // Restore deleted user
  restore: async (userId: string): Promise<boolean> => {
    const response = await apiClient.patch<ApiResponse<string>>(
      `/user/restore/${userId}`
    );
    
    // If backend returns success: false, throw error to trigger catch block
    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Khôi phục người dùng thất bại');
      (error as any).response = { data: response.data };
      throw error;
    }
    
    return true;
  },

  // Get user profile by email/username/phone
  getUserProfile: async (userInformation: string): Promise<UserResponse> => {
    const response = await apiClient.get<ApiResponse<UserResponse>>(
      `/user/profile?userInformation=${encodeURIComponent(userInformation)}`
    );
    return response.data.data;
  },

  // Get users by role
  getUsersByRole: async (roleName: string): Promise<UserResponse[]> => {
    const response = await apiClient.get<ApiResponse<UserResponse[]>>(
      `/user/by-role?roleName=${encodeURIComponent(roleName)}`
    );
    return response.data.data;
  },

  // Get technicians (special endpoint with TechnicianResponse)
  getTechnicians: async (): Promise<UserResponse[]> => {
    const response = await apiClient.get<ApiResponse<UserResponse[]>>(
      `/user/technicians`
    );
    return response.data.data;
  },

  // Update profile (no password, role, username changes)
  updateProfile: async (userId: string, data: {
    email?: string;
    fullName?: string;
    numberPhone?: string;
    address?: string;
    avatarUrl?: string;
  }): Promise<UserResponse> => {
    const response = await apiClient.patch<ApiResponse<UserResponse>>(
      `/user/profile/${userId}`,
      data
    );
    
    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Cập nhật profile thất bại');
      (error as any).response = { data: response.data };
      throw error;
    }
    
    return response.data.data;
  }
};

