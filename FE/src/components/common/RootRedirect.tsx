import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../context/useAuthContext';
import { useEffect, useState } from 'react';
import { notify } from '../admin/common/Toast';

export const RootRedirect = () => {
  const { user, isLoading } = useAuthContext();
  const location = useLocation();
  const [isProcessingGoogleAuth, setIsProcessingGoogleAuth] = useState(false);

  // Handle Google OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const isGoogleAuth = urlParams.get('googleAuth') === 'true';
    
    if (isGoogleAuth) {
      setIsProcessingGoogleAuth(true);
      const accessToken = urlParams.get('accessToken');
      const refreshToken = urlParams.get('refreshToken');
      const encodedName = urlParams.get('name');
      const email = urlParams.get('email');
      
      const name = encodedName ? decodeURIComponent(encodedName) : '';
      
      if (accessToken && refreshToken) {
        // Save tokens
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        
        // Show success message
        notify.success(`Đăng nhập Google thành công! Xin chào ${name || email}`);
        
        // Clean URL and reload to apply auth context
        window.history.replaceState({}, document.title, '/');
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        notify.error('Đăng nhập Google thất bại. Vui lòng thử lại.');
        setIsProcessingGoogleAuth(false);
      }
    }
  }, [location.search]);

  if (isLoading || isProcessingGoogleAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">
            {isProcessingGoogleAuth ? 'Đang xử lý đăng nhập Google...' : 'Đang tải...'}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    // Nếu chưa đăng nhập, chuyển về trang client (trang chủ công khai)
    return <Navigate to="/client" replace />;
  }

  // Kiểm tra role và redirect phù hợp
  const isAdminRole = user.isAdmin || 
                     user.roleName?.includes('ADMIN') || 
                     user.roleName?.includes('STAFF') || 
                     user.roleName?.includes('TECHNICIAN');

  if (isAdminRole) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Mặc định cho client/customer
  return <Navigate to="/client" replace />;
};

