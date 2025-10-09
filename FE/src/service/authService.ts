import { API_BASE_URL } from "../constants/apiConstants";
import { LOGIN, REGISTER } from "../constants/authConstant";
import type { ApiResponse } from "../type/api";
import type {
    LoginRequest,
    LoginResponse,
    RegisterUserRequest,
    RegisterUserResponse,
    LogoutRequest,
    LogoutResponse
} from "../type/auth";
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
        const response = await apiClient.post<ApiResponse<LogoutResponse>>(`${API_BASE}/auth/logout`, data);
        return response;
    },

}