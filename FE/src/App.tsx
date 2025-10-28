import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './layouts/Layout';
import { LayoutAdmin } from './layouts/LayoutAdmin';
import { AdminRoutes, ClientRoutes } from './routes';
import { Toast } from './components/admin/common/Toast';
import { LoginPage } from './pages/admin/login/Login';
import ClientLogin from './pages/client/account/ClientLogin';
import ClientRegister from './pages/client/account/ClientRegister';
import GoogleCallback from './pages/client/account/GoogleCallback';
import { AuthProvider } from './context/AuthContext.tsx';
import RoleProtectedRoute from './components/common/RoleProtectedRoute';
import { RootRedirect } from './components/common/RootRedirect';


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
            <Route path="/oauth2/callback" element={<GoogleCallback />} />

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
              {AdminRoutes.map(({ path, element }) => (
                <Route key={path} path={path} element={element} />
              ))}
            </Route>
          </Routes>
        </AuthProvider>
        <Toast />
      </BrowserRouter>
    </>
  )
}

export default App
