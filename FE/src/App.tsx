import './App.css'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Layout } from './layouts/Layout';
import { LayoutAdmin } from './layouts/LayoutAdmin';
import { AdminRoutes, ClientRoutes } from './routes';
import { Toast } from './components/admin/common/Toast';
import { LoginPage } from './pages/admin/login/Login';
import ClientLogin from './pages/client/account/ClientLogin';
import ClientRegister from './pages/client/account/ClientRegister';
import { AuthProvider } from './context/AuthContext.tsx';
import RoleProtectedRoute from './components/common/RoleProtectedRoute';
import { RootRedirect } from './components/common/RootRedirect';
import { useAuthContext } from './context/useAuthContext';
import { PaymentSuccessMessage } from './pages/admin/payment/PaymentSuccessMessage';
import { PaymentFailMessage } from './pages/admin/payment/PaymentFailMessage';


const AdminIndexRedirect: React.FC = () => {
  const { user, isLoading } = useAuthContext();
  if (isLoading) return null;
  const to = user?.roleName?.includes('TECHNICIAN') ? '/admin/schedule' : '/admin/dashboard';
  return <Navigate to={to} replace />;
};

function App() {

  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Root path - redirect based on user role */}
            <Route path="/" element={<RootRedirect />} />

            {/* Client routes */}
            <Route path="/client/login" element={<ClientLogin />} />
            <Route path="/client/register" element={<ClientRegister />} />

            <Route path="/client" element={<Layout />}>
              {ClientRoutes.map(({ path, element }) => (
                <Route key={path} path={path} element={element} />
              ))}
            </Route>

            {/* Admin routes - Protected */}
            <Route path="admin/login" element={<LoginPage />} />

            <Route 
              path="admin" 
              element={
                <RoleProtectedRoute requireAdmin={true}>
                  <LayoutAdmin />
                </RoleProtectedRoute>
              }
            >
              {/* Default redirect to dashboard (technician -> schedule) */}
              <Route index element={<AdminIndexRedirect />} />
              
              {AdminRoutes.map(({ path, element }) => (
                <Route key={path} path={path} element={element} />
              ))}
            </Route>

            {/* Public payment message pages (for mobile users after payment) */}
            <Route path="/payment/success-message" element={<PaymentSuccessMessage />} />
            <Route path="/payment/fail-message" element={<PaymentFailMessage />} />
          </Routes>
        </AuthProvider>
        <Toast />
      </BrowserRouter>
    </>
  )
}

export default App
