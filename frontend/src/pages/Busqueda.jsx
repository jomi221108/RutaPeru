import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { buscarServicios } from "../api/servicioApi";
import { useAuth } from "../auth/AuthContext";

const TIPOS = ["Todos", "Hospedaje", "Tour", "Transporte"];

function mensajeDeError(error) {
  if (error.response?.data?.mensaje) return error.response.data.mensaje;
  if (error.response?.status === 401) return "Tu sesión expiró. Inicia sesión nuevamente.";
  if (error.request) {
    return "No se pudo conectar con el servidor. Verifica que el backend esté corriendo en http://localhost:8080.";
  }
  return "No se pudo completar la búsqueda. Intenta nuevamente.";
}

/**
 * Sprint 2 — HU.03: buscar y filtrar servicios turísticos (hospedaje, tours
 * y transporte) publicados por proveedores verificados.
 */
export default function Busqueda() {
  const navigate = useNavigate();
  const { sesion, cerrarSesion } = useAuth();
  const [tipoServicio, setTipoServicio] = useState("Todos");
  const [ubicacion, setUbicacion] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  async function buscar(evento) {
    if (evento) evento.preventDefault();
    setCargando(true);
    setError("");
    try {
      const filtros = {
        tipoServicio: tipoServicio === "Todos" ? "" : tipoServicio,
        ubicacion,
        precioMax: precioMax || undefined,
      };
      const resultados = await buscarServicios(sesion.credenciales, filtros);
      setServicios(resultados);
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    buscar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nombreMostrado = sesion?.usuario?.nombreCompleto || sesion?.usuario?.nombreUsuario;

  return (
    <div className="busqueda-shell">
      <header className="busqueda-topbar">
        <div className="marca">
          <span className="marca__icono">RP</span>
          <span className="marca__nombre">RutaPerú</span>
        </div>
        <div className="busqueda-topbar__identidad">
          {nombreMostrado && <span>{nombreMostrado}</span>}
          <button className="boton-secundario" onClick={() => { cerrarSesion(); navigate("/"); }}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="busqueda-content">
        <div className="busqueda-heading">
          <p className="busqueda-eyebrow">Sprint 2 — Búsqueda y Reserva</p>
          <h1>Encuentra tu próximo servicio turístico</h1>
          <p>Hospedaje, tours y transporte en destinos a nivel nacional.</p>
        </div>

        <form className="busqueda-filtros" onSubmit={buscar}>
          <div className="campo">
            <label htmlFor="tipoServicio">Tipo de servicio</label>
            <select id="tipoServicio" value={tipoServicio} onChange={(e) => setTipoServicio(e.target.value)}>
              {TIPOS.map((tipo) => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="ubicacion">Ubicación</label>
            <input
              id="ubicacion"
              type="text"
              placeholder="Cusco, Arequipa, Lima..."
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
            />
          </div>
          <div className="campo">
            <label htmlFor="precioMax">Precio máximo (S/)</label>
            <input
              id="precioMax"
              type="number"
              min="0"
              step="1"
              value={precioMax}
              onChange={(e) => setPrecioMax(e.target.value)}
            />
          </div>
          <button className="boton-primario busqueda-filtros__boton" type="submit" disabled={cargando}>
            {cargando ? "Buscando..." : "Buscar"}
          </button>
        </form>

        {error && <div className="mensaje mensaje--error">{error}</div>}

        {!cargando && !error && servicios.length === 0 && (
          <p className="busqueda-vacio">No se encontraron servicios con esos filtros.</p>
        )}

        <div className="busqueda-resultados">
          {servicios.map((servicio) => (
            <Link key={servicio.idServicio} to={`/servicios/${servicio.idServicio}`} className="tarjeta-servicio">
              <span className={`etiqueta-tipo etiqueta-tipo--${servicio.tipoServicio.toLowerCase()}`}>
                {servicio.tipoServicio}
              </span>
              <h3>{servicio.nombre}</h3>
              <p className="tarjeta-servicio__ubicacion">{servicio.ubicacion}</p>
              <p className="tarjeta-servicio__proveedor">{servicio.proveedorRazonSocial}</p>
              <p className="tarjeta-servicio__precio">S/ {Number(servicio.precio).toFixed(2)}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
