
import { API_BASE_URL } from "../constants/apiConstants";
import type { ApiResponse } from "../types/api";
import { apiClient } from "./api";
import type { RoleResponse } from "../types/admin/role";
import { GET_ALL_ROLES } from "../constants/roleConstants";

export const roleService = {
    getAllRole: async () => {
        const response = await apiClient.get<ApiResponse<RoleResponse[]>>(`${API_BASE_URL}/${GET_ALL_ROLES}`);
        return response;
    },
};