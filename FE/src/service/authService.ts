import { API_BASE_URL } from "../constants/apiConstants";
import { LOGIN, REGISTER } from "../constants/authConstant";
import type {LoginRequest, LoginResponse, RegisterUserRequest, RegisterUserResponse } from "../types/admin/auth";
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

    logout: async () => {
        // No need to call backend - just clear local storage
        return Promise.resolve();
    },

}