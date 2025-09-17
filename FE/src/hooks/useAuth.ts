import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { LoginRequest } from "../type/login";
import { authService } from "../service/authService";
import { notify } from "../components/admin/common/Toast";
import { AxiosError } from "axios";

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
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
            navigate("/admin/dashboard");
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
      // Không throw error nữa để không làm crash app
    } finally {
      setIsLoading(false);
    }
  };











 

 




  return {
    login,
    isLoading,
  };
}