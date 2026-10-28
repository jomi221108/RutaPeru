import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import AdminUsuarios from "./pages/AdminUsuarios";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Bienvenida from "./pages/Bienvenida";
import Busqueda from "./pages/Busqueda";
import DetalleServicio from "./pages/DetalleServicio";
import { useAuth } from "./auth/AuthContext";
import { AuthProvider } from "./auth/AuthProvider";

function RutaAdministrador({ children }) {
  const { sesion } = useAuth();
  if (!sesion) return <Navigate to="/" replace />;
  if (sesion.usuario.rol !== "Administrador") {
    return <Navigate to="/bienvenida" replace />;
  }
  return children;
}

/** Sprint 2: cualquier usuario autenticado puede buscar y reservar servicios. */
function RutaProtegida({ children }) {
  const { sesion } = useAuth();
  if (!sesion) return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/bienvenida" element={<Bienvenida />} />
          <Route
            path="/buscar"
            element={
              <RutaProtegida>
                <Busqueda />
              </RutaProtegida>
            }
          />
          <Route
            path="/servicios/:id"
            element={
              <RutaProtegida>
                <DetalleServicio />
              </RutaProtegida>
            }
          />
          <Route
            path="/admin/usuarios"
            element={
              <RutaAdministrador>
                <AdminUsuarios />
              </RutaAdministrador>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
