import { API_BASE_URL } from "../constants/apiConstants";
import { LOGIN, REGISTER, LOGOUT } from "../constants/authConstant";
import type {LoginRequest, LoginResponse, RegisterUserRequest, RegisterUserResponse, LogoutRequest } from "../types/admin/auth";
import type { ApiResponse } from "../types/api";


import { apiClient } from "./api";

const API_BASE = `${API_BASE_URL}`;

export const authService = {
    login: async (data: LoginRequest) => {
        const response = await apiClient.post<ApiResponse<LoginResponse>>(`${API_BASE}/${LOGIN}`, data);
        return response;
    },
    registerUser: async (data: RegisterUserRequest) => {
        const response = await apiClient.post<ApiResponse<RegisterUserResponse>>(`${API_BASE}/${REGISTER}`, data);
        return response;
    },

    logout: async (data: LogoutRequest) => {
        const response = await apiClient.post<ApiResponse<string>>(`${API_BASE}/${LOGOUT}`, data);
        return response;
    },

}