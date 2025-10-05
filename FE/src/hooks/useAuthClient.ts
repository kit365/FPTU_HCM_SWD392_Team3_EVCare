import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { LoginRequest, LogoutRequest } from "../type/auth";
import type { RegisterUserRequest } from "../type/auth";
import { authService } from "../service/authService";
import { notify } from "../components/admin/common/Toast";
import { AxiosError } from "axios";
import { useAuthContext } from '../context/useAuthContext.tsx';


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
      if (response?.data.success === true) {
        notify.success(response?.data.message || "Đăng nhập thành công")
        //in token ra màn hình
        console.log("token trả về:", response.data.data.token)
        //lưu accesstoken local storage
        localStorage.setItem('access_token', response.data.data.token);
        await refreshUser(); // Gọi API lấy user và set vào context      
        navigate("/");
      } else {
        console.log(response?.data.message);
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
        const logoutData: LogoutRequest = { userId };
        const response = await authService.logout(logoutData);
        
        if (response?.data?.success) {
          notify.success(response?.data?.message || "Đăng xuất thành công");
        }
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Vẫn logout ở client dù API fail
    } finally {
      // Clear token và user data
      localStorage.removeItem('access_token');
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