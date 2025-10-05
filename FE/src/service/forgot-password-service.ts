
import { API_BASE_URL } from "../constants/apiConstants";
import { REQUEST_OTP, RESET_PASSWORD, VERIFY_OTP } from "../constants/forgot-password.constant";
import type { ApiResponse } from "../type/api";
import type { RequestOtpRequest, ResetPasswordRequest, VerifyOtpRequest, VerifyOtpResponse } from "../type/forgot-password";
import { apiClient } from "./api";

export const forgotPasswordService = {
    requestOTP: async (data: RequestOtpRequest) => {
    const response = await apiClient.post<ApiResponse<string>>(`${API_BASE_URL}/${REQUEST_OTP}`, data);
    return response;
    console.log("Request OTP response:", response); 
},

    verifyOTP: async (data: VerifyOtpRequest) => {
        const response = await apiClient.post<ApiResponse<VerifyOtpResponse>>(`${API_BASE_URL}/${VERIFY_OTP}`, data);
        return response;
        console.log("Verify OTP response:", response); 
    },

    resetPassword: async (data: ResetPasswordRequest) => {
        const response = await apiClient.post<ApiResponse<string>>(`${API_BASE_URL}/${RESET_PASSWORD}`, data);
        return response;
        console.log("Reset Password response:", response); 
    },

}