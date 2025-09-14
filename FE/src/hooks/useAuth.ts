import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { LoginRequest } from "../type/login";
import { authService } from "../service/authService";

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
            navigate("/admin/dashboard");
      } else {
        throw new Error(response?.data.message || "Đăng nhập thất bại");    
      }
        // showSuccessToast("Đăng nhập thành công!");
    } catch (error: any) {
    //   showErrorToast(error?.message || "Đăng nhập thất bại");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };











 

 




  return {
    login,
  };
}