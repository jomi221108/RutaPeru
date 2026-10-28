import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import AdminUsuarios from "./pages/AdminUsuarios";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Bienvenida from "./pages/Bienvenida";
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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/bienvenida" element={<Bienvenida />} />
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
