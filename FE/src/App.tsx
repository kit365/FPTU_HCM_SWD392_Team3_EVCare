import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './layouts/Layout';
import { LayoutAdmin } from './layouts/LayoutAdmin';
import { AdminRoutes, ClientRoutes } from './routes';
import { Toast } from './components/admin/common/Toast';
import { LoginPage } from './pages/admin/login/Login';
import ClientLogin from './pages/client/account/ClientLogin';
import ClientRegister from './pages/client/account/ClientRegister';
import { AuthProvider } from './context/AuthContext.tsx';


function App() {

  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/client/login" element={<ClientLogin />} />

            <Route path="/client/register" element={<ClientRegister />} />

            <Route element={<Layout />}>
              {ClientRoutes.map(({ path, element }) => (
                <Route key={path} path={path} element={element} />
              ))}
            </Route>

            <Route path="admin/login" element={<LoginPage />} />

            <Route path="admin" element={<LayoutAdmin />}>
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
