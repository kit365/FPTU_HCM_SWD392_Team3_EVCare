import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './layouts/Layout';
import { LayoutAdmin } from './layouts/LayoutAdmin';
import { AdminRoutes, ClientRoutes } from './routes';

function App() {

  return (
    <>
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
      </BrowserRouter>
    </>
  )
}

export default App
