// import { ThemeProvider } from '@mui/material/styles';
import './App.css'
// import { ColorModeContext, useMode } from './theme'
// import CssBaseline from '@mui/material/CssBaseline';
// import { Topbar } from './layouts/Topbar';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './layouts/Layout';
import { LayoutAdmin } from './layouts/LayoutAdmin';
import { AdminRoutes, ClientRoutes } from './routes';
import { Toast } from './components/admin/common/Toast';

function App() {
  // const [theme, colorMode] = useMode();

  return (
    <>
      {/* <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div className="app">
            <main className="content">
              <Topbar />
            </main>
          </div>
        </ThemeProvider>
      </ColorModeContext.Provider> */}

      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            {ClientRoutes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
          </Route>

          <Route path="admin" element={<LayoutAdmin />}>
            {AdminRoutes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
          </Route>
        </Routes>
        <Toast />
      </BrowserRouter>
    </>
  )
}

export default App
