import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../service/authService";
import { notify } from "../components/admin/common/Toast";
import { AxiosError } from "axios";
import { useAuthContext } from '../context/useAuthContext.tsx';
import type { LoginRequest, RegisterUserRequest } from "../types/admin/auth.ts";
export function useAuthClient() {
  const [isLoading, setIsLoading] = useState(false);
  const { refreshUser, setUser } = useAuthContext();
  const navigate = useNavigate();
  const login = async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);
      //   if (!res?.token) {
      //     showErrorToast("Đăng nhập thất bại: Không nhận được token");
      //     return null;
      //   }
      if (response?.data.success === true && response.data.data) {
        notify.success(response?.data.message || "Đăng nhập thành công")
        
        // Extract tokens from response
        const { token, refreshToken } = response.data.data;
        console.log("Tokens received:", { token, refreshToken });
        
        // Save tokens to localStorage
        localStorage.setItem('access_token', token);
        localStorage.setItem('refresh_token', refreshToken);
        
        // Get user info using token
        console.log("Fetching user info...");
        try {
          await refreshUser(); // Gọi API lấy user và set vào context
          console.log("User info loaded successfully");
        } catch (userError) {
          console.error("Error loading user info:", userError);
          notify.error("Không thể tải thông tin người dùng");
        }
        
        navigate("/");
      } else {
        console.log("Login failed:", response?.data.message);
        notify.error(response?.data.message || "Đăng nhập thất bại");
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response && axiosError.response.data) {
        notify.error((axiosError.response.data as any).message || "Đăng nhập thất bại");
      } else {
        notify.error(axiosError?.message || "Đăng nhập thất bại");
      }
    } finally {
      setIsLoading(false);
    }
  };
  const registerUser = async (data: RegisterUserRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.registerUser(data);
      if (response?.data?.success === true) {
        notify.success(response?.data?.message || "Đăng ký thành công");
      } else {
        notify.error(response?.data?.message || "Đăng ký thất bại");
      }
      return response;
    } catch (error) {
      notify.error("Đăng ký tài khoản thất bại");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  const logout = async () => {
    setIsLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user?.id;
      if (userId) {
        // const logoutData: LogoutRequest = { userId };
        // const response = await authService.logout(logoutData);
        // if (response?.data?.success) {
        //   notify.success(response?.data?.message || "Đăng xuất thành công");
        // }
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Vẫn logout ở client dù API fail
    } finally {
      // Clear tokens và user data
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
      setIsLoading(false);
      navigate("/client/login");
    }
  };
  return {
    login,
    registerUser,
    isLoading,
    logout
  };
}