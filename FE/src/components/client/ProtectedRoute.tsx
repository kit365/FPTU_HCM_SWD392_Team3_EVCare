import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../../context/useAuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuthContext();

  // Hiển thị loading trong khi kiểm tra authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Đang kiểm tra đăng nhập...</div>
      </div>
    );
  }

  // Nếu user chưa đăng nhập, tự động chuyển về trang chủ
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Nếu user đã đăng nhập, render children
  return <>{children}</>;
};

export default ProtectedRoute;
