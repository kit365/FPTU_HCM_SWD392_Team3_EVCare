import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../../context/useAuthContext';


export const RootRedirect = () => {
  const { user, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }

  if (user?.isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/client" replace />;
};

