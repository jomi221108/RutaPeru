import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

/**
 * Página en blanco posterior al login/registro exitoso.
 * Alcance del Sprint 1: únicamente confirma que la autenticación funcionó;
 * el contenido real de esta pantalla se implementará en sprints siguientes.
 */
export default function Bienvenida() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cerrarSesion } = useAuth();
  const { nombreCompleto, nombreUsuario, rol } = location.state || {};

  return (
    <div className="pagina-bienvenida">
      <h1>¡Bienvenido(a) a RutaPerú{nombreCompleto ? `, ${nombreCompleto}` : ""}!</h1>
      <p>
        {nombreUsuario
          ? `Sesión iniciada como "${nombreUsuario}"${rol ? ` (rol: ${rol})` : ""}.`
          : "Has iniciado sesión correctamente."}
      </p>
      <p>Esta pantalla se completará en los siguientes sprints.</p>
      <button className="boton-secundario" onClick={() => { cerrarSesion(); navigate("/"); }}>
        Cerrar sesión
      </button>
    </div>
  );
}
