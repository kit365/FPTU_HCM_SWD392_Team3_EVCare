import { useState } from "react";
import type { RequestOtpRequest, VerifyOtpResponse, ResetPasswordRequest } from "../type/forgot-password";
import { forgotPasswordService } from "../service/forgot-password-service";
import { notify } from "../components/admin/common/Toast";
import type { VerifyOtpRequest } from "../type/forgot-password";
import type { ApiResponse } from "../type/api";


export function useForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);


    const requestOTP = async (data: RequestOtpRequest): Promise<ApiResponse<string>> => {
        let FAIL_MESSAGE = "Yêu cầu OTP thất bại";
        let SUCCESS_MESSAGE = "Yêu cầu gửi OTP thành công";
        setIsLoading(true);
        try {
            const response = await forgotPasswordService.requestOTP(data);
            if (response?.data.success === true) {
                notify.success(response?.data.message || SUCCESS_MESSAGE );
                console.log(response?.data);
                return response.data;
            } else {
                notify.error(response?.data.message || FAIL_MESSAGE);
                throw new Error(response?.data.message || FAIL_MESSAGE);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const verifyOTP = async (data: VerifyOtpRequest): Promise<ApiResponse<VerifyOtpResponse>> => {
        setIsLoading(true);
        try {
            const response = await forgotPasswordService.verifyOTP(data);
            console.log(response);
            
            if (response?.data.success === true && response?.data.data?.isValid) {
                notify.success(response?.data.message || "Xác thực OTP thành công");
            } else {
                notify.error(response?.data.message || "Xác thực OTP thất bại");
            }
            return response.data;
        } finally {
            setIsLoading(false);
        }
    };

    const resetPassword = async (data: ResetPasswordRequest): Promise<ApiResponse<string>> => {
        setIsLoading(true);
        try {
            const response = await forgotPasswordService.resetPassword(data);
            if (response?.data.success === true) {
                notify.success(response?.data.message || "Đổi mật khẩu thành công");
            } else {
                notify.error(response?.data.message || "Đổi mật khẩu thất bại");
            }
            return response.data;
        } catch (error) {
            notify.error("Đổi mật khẩu thất bại");
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

  return {
    isLoading,
    requestOTP,
    verifyOTP,
    resetPassword,
  };
}