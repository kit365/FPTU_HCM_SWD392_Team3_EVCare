import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../service/authService";
import { notify } from "../components/admin/common/Toast";
import { AxiosError } from "axios";
import { useAuthContext } from '../context/useAuthContext';
import type { LoginRequest, RegisterUserRequest } from "../types/admin/auth";

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const { refreshUser } = useAuthContext();
  const navigate = useNavigate();

  const login = async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);
      
      if (response?.data.success === true && response.data.data) {
        notify.success(response?.data.message || "Đăng nhập thành công");

        const { token, refreshToken } = response.data.data;
        localStorage.setItem('access_token', token);
        localStorage.setItem('refresh_token', refreshToken);
        try {
          await refreshUser(); 
          navigate("/");
        } catch (userError) {
          console.error("Admin login - Error loading user info:", userError);
          notify.error("Không thể tải thông tin người dùng");
        }
      } else {
        console.log("Admin login failed:", response?.data.message);
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
      // API logout nếu cần
      // await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear tokens và user data
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setIsLoading(false);
      navigate("/admin/login");
    }
  };

  return {
    login,
    registerUser,
    logout,
    isLoading,
  };
}