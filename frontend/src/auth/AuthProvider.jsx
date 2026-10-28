import { useState } from "react";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(null);

  function guardarSesion(usuario, credenciales) {
    setSesion({ usuario, credenciales });
  }

  function cerrarSesion() {
    setSesion(null);
  }

  return (
    <AuthContext.Provider value={{ sesion, guardarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}