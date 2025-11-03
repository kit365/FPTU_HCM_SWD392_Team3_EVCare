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
  getById: async (userId: string, forceRefresh?: boolean): Promise<UserResponse> => {
    // Add timestamp to bypass cache if forceRefresh is true
    const url = forceRefresh 
      ? `/user/${userId}?_t=${Date.now()}`
      : `/user/${userId}`;
    const response = await apiClient.get<ApiResponse<UserResponse>>(url);
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
  // Alias: getProfile (for convenience)
  getProfile: async (userInformation: string): Promise<UserResponse> => {
    const response = await apiClient.get<ApiResponse<UserResponse>>(
      `/user/profile`,
      { params: { userInformation } }
    );
    return response.data.data;
  },

  // Get users by role
  getUsersByRole: async (roleName: string): Promise<UserResponse[]> => {
    console.log('📞 Calling getUsersByRole:', roleName);
    const response = await apiClient.get<ApiResponse<UserResponse[]>>(
      `/user/by-role?roleName=${encodeURIComponent(roleName)}`
    );
    console.log('📦 Response data:', response.data);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Không thể tải danh sách user');
    }
    
    const users = response.data.data || [];
    console.log(`✅ Loaded ${users.length} users with role ${roleName}`);
    return users;
  },

  // Get technicians (special endpoint with TechnicianResponse)
  getTechnicians: async (): Promise<UserResponse[]> => {
    console.log('📞 Calling getTechnicians');
    const response = await apiClient.get<ApiResponse<UserResponse[]>>(
      `/user/technicians`
    );
    console.log('📦 Response data:', response.data);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Không thể tải danh sách technicians');
    }
    
    const technicians = response.data.data || [];
    console.log(`✅ Loaded ${technicians.length} technicians`);
    return technicians;
  },

  // Update profile (no password, role, username changes)
  updateProfile: async (userId: string, data: {
    email?: string;
    fullName?: string;
    numberPhone?: string;
    address?: string;
    avatarUrl?: string;
    backgroundUrl?: string;
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
  },

  // Delete own account
  deleteMyAccount: async (userId: string): Promise<boolean> => {
    const response = await apiClient.delete<ApiResponse<string>>(
      `/user/profile/${userId}`
    );
    
    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Xóa tài khoản thất bại');
      (error as any).response = { data: response.data };
      throw error;
    }
    
    return true;
  },

  // Find deleted user by email, username, or phone
  // NOTE: This requires backend to support finding deleted users
  // Backend should add endpoints like:
  // - GET /user/deleted/by-email?email=...
  // - GET /user/deleted/by-username?username=...
  // - GET /user/deleted/by-phone?phone=...
  findDeletedUser: async (identifier: { email?: string; username?: string; phone?: string }): Promise<UserResponse | null> => {
    try {
      // Try by email first
      if (identifier.email) {
        try {
          const response = await apiClient.get<ApiResponse<UserResponse>>(
            `/user/deleted/by-email?email=${encodeURIComponent(identifier.email)}`
          );
          if (response.data?.success && response.data.data) {
            return response.data.data;
          }
        } catch (error) {
          // Continue to try other methods
        }
      }
      
      // Try by username
      if (identifier.username) {
        try {
          const response = await apiClient.get<ApiResponse<UserResponse>>(
            `/user/deleted/by-username?username=${encodeURIComponent(identifier.username)}`
          );
          if (response.data?.success && response.data.data) {
            return response.data.data;
          }
        } catch (error) {
          // Continue to try phone
        }
      }
      
      // Try by phone
      if (identifier.phone) {
        try {
          const response = await apiClient.get<ApiResponse<UserResponse>>(
            `/user/deleted/by-phone?phone=${encodeURIComponent(identifier.phone)}`
          );
          if (response.data?.success && response.data.data) {
            return response.data.data;
          }
        } catch (error) {
          // All methods failed
        }
      }
      
      return null;
    } catch (error) {
      // API doesn't exist yet, return null
      return null;
    }
  }
};

