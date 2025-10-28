import { apiClient } from './api';
import type { ApiResponse } from '../types/common';

export interface RoleResponse {
  roleId: string;
  roleName: string;
}

export const roleService = {
  // Get all roles
  getAllRoles: async (): Promise<RoleResponse[]> => {
    const response = await apiClient.get<ApiResponse<RoleResponse[]>>('/role/');
    return response.data.data;
  },
};
