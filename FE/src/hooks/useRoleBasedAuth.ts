import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../service/authService';
import { notify } from '../components/admin/common/Toast';
import { AxiosError } from 'axios';
import { useAuthContext } from '../context/useAuthContext';
import type { LoginRequest } from '../types/admin/auth';

interface UseRoleBasedAuthProps {
  allowedRoles: string[];
  redirectPath: string;
  errorMessage: string;
}

export function useRoleBasedAuth({ allowedRoles, redirectPath, errorMessage }: UseRoleBasedAuthProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { refreshUser, user } = useAuthContext();
  const navigate = useNavigate();
  const hasShownNotification = useRef(false); // Flag to prevent multiple notifications

  // Reset flag when user logs out
  useEffect(() => {
    if (!user) {
      hasShownNotification.current = false;
    }
  }, [user]);

  // Kiểm tra role khi user thay đổi
  useEffect(() => {
    if (user && !hasShownNotification.current) {
      const hasAllowedRole = user.roleName?.some((role: string) => allowedRoles.includes(role)) || 
                            (allowedRoles.includes('ADMIN') && user.isAdmin);
      
      if (!hasAllowedRole) {
        // Role không phù hợp, clear token và hiển thị lỗi
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        hasShownNotification.current = true; // Mark as shown
        notify.error(errorMessage);
        return;
      }
      
      // Role phù hợp, thông báo thành công và redirect
      hasShownNotification.current = true; // Mark as shown
      notify.success('Đăng nhập thành công');
      
      // Redirect động dựa trên role
      const isTechnician = user.roleName?.includes('TECHNICIAN');
      const finalRedirectPath = isTechnician ? '/admin/schedule' : redirectPath;
      navigate(finalRedirectPath);
    }
  }, [user, allowedRoles, redirectPath, errorMessage, navigate]);

  const login = async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);
      
      if (response?.data.success === true && response.data.data) {
        const { token, refreshToken } = response.data.data;
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

  return {
    login,
    isLoading,
  };
}
