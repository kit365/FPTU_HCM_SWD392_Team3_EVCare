import { API_BASE_URL } from "../constants/apiConstants";
import type { ApiResponse } from "../type/api";
import type { LoginRequest, LoginResponse } from "../type/login";
import { apiClient } from "./api";

const API_BASE = `${API_BASE_URL}/auth`;

export const authService = {
    login: async (data: LoginRequest) => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(`${API_BASE}/login`, data);
    return response;
    console.log("Login response:", response); 
},

}