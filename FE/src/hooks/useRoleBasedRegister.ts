import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../service/authService';
import { notify } from '../components/admin/common/Toast';
import { AxiosError } from 'axios';
import { useAuthContext } from '../context/useAuthContext';
import type { RegisterUserRequest, LoginRequest } from '../types/admin/auth';

interface UseRoleBasedRegisterProps {
  allowedRoles: string[];
  redirectPath: string;
  errorMessage: string;
}

export function useRoleBasedRegister({ allowedRoles, redirectPath, errorMessage }: UseRoleBasedRegisterProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { refreshUser, user } = useAuthContext();
  const navigate = useNavigate();

  // Kiểm tra role khi user thay đổi
  useEffect(() => {
    if (user) {
      const hasAllowedRole = user.roleName?.some((role: string) => allowedRoles.includes(role)) || 
                            (allowedRoles.includes('ADMIN') && user.isAdmin);
      
      if (!hasAllowedRole) {
        // Role không phù hợp, clear token và hiển thị lỗi
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        notify.error(errorMessage);
        return;
      }
      
      // Role phù hợp, thông báo thành công và redirect
      notify.success('Đăng ký và đăng nhập thành công');
      navigate(redirectPath);
    }
  }, [user, allowedRoles, redirectPath, errorMessage, navigate]);

  const registerAndLogin = async (registerData: RegisterUserRequest) => {
    setIsLoading(true);
    try {
      // Bước 1: Đăng ký tài khoản
      const registerResponse = await authService.registerUser(registerData);
      
      if (registerResponse?.data?.success === true) {
        notify.success('Đăng ký thành công! Đang đăng nhập...');
        
        // Bước 2: Tự động đăng nhập với thông tin vừa đăng ký
        const loginData: LoginRequest = {
          email: registerData.email,
          password: registerData.password
        };
        
        const loginResponse = await authService.login(loginData);
        
        if (loginResponse?.data.success === true && loginResponse.data.data) {
          const { token, refreshToken } = loginResponse.data.data;
          localStorage.setItem('access_token', token);
          localStorage.setItem('refresh_token', refreshToken);
          
          try {
            await refreshUser();
            // useEffect sẽ xử lý việc kiểm tra role và redirect
          } catch (userError) {
            console.error("Error loading user info:", userError);
            notify.error("Không thể tải thông tin người dùng");
          }
        } else {
          console.log("Auto login failed:", loginResponse?.data.message);
          notify.error("Đăng ký thành công nhưng không thể tự động đăng nhập. Vui lòng đăng nhập thủ công.");
          navigate('/client/login');
        }
      } else {
        console.log("Register failed:", registerResponse?.data.message);
        notify.error(registerResponse?.data.message || "Đăng ký thất bại");
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response && axiosError.response.data) {
        notify.error((axiosError.response.data as any).message || "Đăng ký thất bại");
      } else {
        notify.error(axiosError?.message || "Đăng ký thất bại");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    registerAndLogin,
    isLoading,
  };
}
