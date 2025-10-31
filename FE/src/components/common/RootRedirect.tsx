import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../../context/useAuthContext';

/**
 * RootRedirect - Smart routing component for "/" path
 * 
 * Redirects users based on authentication state and role:
 * - Not logged in → /client (public homepage)
 * - Admin/Staff/Technician → /admin/dashboard
 * - Customer → /client
 */
export const RootRedirect = () => {
  const { user, isLoading } = useAuthContext();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Đang tải...</div>
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

