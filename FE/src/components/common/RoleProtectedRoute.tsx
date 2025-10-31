import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../context/useAuthContext';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[]; // e.g., ['ADMIN', 'STAFF', 'TECHNICIAN']
  requireAdmin?: boolean; // Quick check for admin-level roles
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ 
  children, 
  allowedRoles, 
  requireAdmin = false 
}) => {
  const { user, isLoading } = useAuthContext();
  const location = useLocation();


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Đang kiểm tra quyền truy cập...</div>
      </div>
    );
  }

 
  if (!user) {
    return <Navigate to="/client/login" state={{ from: location }} replace />;
  }

  // Check admin permission using isAdmin field from BE
  if (requireAdmin && !user.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Không có quyền truy cập</h2>
            <p className="text-gray-600 mb-4">
              Bạn không có quyền truy cập trang quản trị. Vui lòng liên hệ quản trị viên nếu bạn cần truy cập.
            </p>
            <p className="text-sm text-gray-500">
              Role của bạn: <span className="font-semibold">{user.roleName?.join(', ') || 'CUSTOMER'}</span>
            </p>
          </div>
          <button
            onClick={() => window.location.href = '/client'}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  // Check specific roles if provided
  if (allowedRoles && allowedRoles.length > 0) {
    const hasAllowedRole = user.roleName?.some(role => allowedRoles.includes(role));
    
    if (!hasAllowedRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
                <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Quyền truy cập bị hạn chế</h2>
              <p className="text-gray-600 mb-4">
                Trang này yêu cầu quyền: <span className="font-semibold">{allowedRoles.join(' hoặc ')}</span>
              </p>
              <p className="text-sm text-gray-500">
                Role của bạn: <span className="font-semibold">{user.roleName?.join(', ') || 'CUSTOMER'}</span>
              </p>
            </div>
            <button
              onClick={() => window.history.back()}
              className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Quay lại
            </button>
          </div>
        </div>
      );
    }
  }


  return <>{children}</>;
};

export default RoleProtectedRoute;

