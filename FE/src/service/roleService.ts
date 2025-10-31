import type { ApiResponse } from '../types/api';
import type { RoleResponse } from '../types/admin/role';
import { apiClient } from './api';

export const roleService = {
  // Get all roles
  getAllRoles: async (): Promise<RoleResponse[]> => {
    const response = await apiClient.get<ApiResponse<RoleResponse[]>>('/role/');
    return response.data.data;
  },
};
