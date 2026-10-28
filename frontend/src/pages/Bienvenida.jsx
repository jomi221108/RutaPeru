import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

/**
 * Página posterior al login/registro. Desde el Sprint 2 es la puerta de
 * entrada a la búsqueda y reserva de servicios turísticos (HU.03-HU.06).
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
      <Link className="enlace-primario" to="/buscar">
        Buscar servicios turísticos
      </Link>
      <button className="boton-secundario" onClick={() => { cerrarSesion(); navigate("/"); }}>
        Cerrar sesión
      </button>
    </div>
  );
}
