import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { obtenerServicio } from "../api/servicioApi";
import { crearReserva } from "../api/reservaApi";
import { useAuth } from "../auth/AuthContext";

const hoy = new Date();
const FECHA_HOY = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;

function mensajeDeError(error) {
  if (error.response?.data?.mensaje) return error.response.data.mensaje;
  if (error.request) {
    return "No se pudo conectar con el servidor. Verifica que el backend esté corriendo en http://localhost:8080.";
  }
  return "No se pudo completar la operación. Intenta nuevamente.";
}

/**
 * Sprint 2 — HU.04 (detalle del servicio), HU.05 (disponibilidad) y
 * HU.06 (generar la reserva, alcance parcial: sin pago).
 */
export default function DetalleServicio() {
  const { id } = useParams();
  const { sesion } = useAuth();
  const [servicio, setServicio] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ fechaInicio: "", fechaFin: "", numeroParticipantes: 1 });
  const [reservando, setReservando] = useState(false);
  const [reserva, setReserva] = useState(null);

  useEffect(() => {
    let vigente = true;
    obtenerServicio(sesion.credenciales, id)
      .then((datos) => { if (vigente) setServicio(datos); })
      .catch((err) => { if (vigente) setError(mensajeDeError(err)); })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function manejarCambio(evento) {
    const { name, value } = evento.target;
    setForm((anterior) => ({ ...anterior, [name]: value }));
  }

  async function manejarReserva(evento) {
    evento.preventDefault();
    setError("");
    setReservando(true);
    try {
      const datos = {
        idServicio: Number(id),
        fechaInicio: form.fechaInicio,
        fechaFin: form.fechaFin || null,
        numeroParticipantes: Number(form.numeroParticipantes),
      };
      const respuesta = await crearReserva(sesion.credenciales, datos);
      setReserva(respuesta);
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setReservando(false);
    }
  }

  if (cargando) {
    return <div className="detalle-estado">Cargando servicio...</div>;
  }

  if (!servicio) {
    return (
      <div className="detalle-estado">
        <p>{error || "No se encontró el servicio."}</p>
        <Link to="/buscar" className="boton-secundario">Volver a la búsqueda</Link>
      </div>
    );
  }

  const esHospedaje = servicio.tipoServicio === "Hospedaje";

  return (
    <div className="detalle-shell">
      <Link to="/buscar" className="detalle-volver">&larr; Volver a resultados</Link>

      <div className="detalle-grid">
        <div className="detalle-info">
          <span className={`etiqueta-tipo etiqueta-tipo--${servicio.tipoServicio.toLowerCase()}`}>
            {servicio.tipoServicio}
          </span>
          <h1>{servicio.nombre}</h1>
          <p className="detalle-ubicacion">{servicio.ubicacion} · {servicio.proveedorRazonSocial}</p>
          <p className="detalle-descripcion">{servicio.descripcion}</p>
          <div className="detalle-datos">
            <div>
              <span>Precio</span>
              <strong>S/ {Number(servicio.precio).toFixed(2)}{esHospedaje ? " / noche" : ""}</strong>
            </div>
            <div>
              <span>Capacidad</span>
              <strong>{servicio.capacidad} persona(s)</strong>
            </div>
          </div>
        </div>

        <div className="detalle-reserva">
          {reserva ? (
            <div className="reserva-confirmada">
              <h2>Reserva generada</h2>
              <p>Tu reserva quedó registrada en estado <b>{reserva.estado}</b>.</p>
              <dl>
                <div><dt>Servicio</dt><dd>{reserva.servicioNombre}</dd></div>
                <div><dt>Fecha de inicio</dt><dd>{reserva.fechaInicio}</dd></div>
                {reserva.fechaFin && <div><dt>Fecha de fin</dt><dd>{reserva.fechaFin}</dd></div>}
                <div><dt>Participantes</dt><dd>{reserva.numeroParticipantes}</dd></div>
                <div><dt>Monto total</dt><dd>S/ {Number(reserva.montoTotal).toFixed(2)}</dd></div>
              </dl>
              <p className="reserva-nota">El pago se completará en un sprint posterior.</p>
              <Link to="/buscar" className="boton-secundario">Buscar otro servicio</Link>
            </div>
          ) : (
            <form className="formulario-reserva" onSubmit={manejarReserva}>
              <h2>Reservar</h2>
              {error && <div className="mensaje mensaje--error">{error}</div>}
              <div className="campo">
                <label htmlFor="fechaInicio">{esHospedaje ? "Fecha de llegada" : "Fecha del servicio"}</label>
                <input
                  id="fechaInicio"
                  name="fechaInicio"
                  type="date"
                  min={FECHA_HOY}
                  value={form.fechaInicio}
                  onChange={manejarCambio}
                  required
                />
              </div>
              {esHospedaje && (
                <div className="campo">
                  <label htmlFor="fechaFin">Fecha de salida</label>
                  <input
                    id="fechaFin"
                    name="fechaFin"
                    type="date"
                    min={form.fechaInicio || FECHA_HOY}
                    value={form.fechaFin}
                    onChange={manejarCambio}
                  />
                </div>
              )}
              <div className="campo">
                <label htmlFor="numeroParticipantes">Participantes</label>
                <input
                  id="numeroParticipantes"
                  name="numeroParticipantes"
                  type="number"
                  min="1"
                  max={servicio.capacidad}
                  value={form.numeroParticipantes}
                  onChange={manejarCambio}
                  required
                />
              </div>
              <button className="boton-primario" type="submit" disabled={reservando}>
                {reservando ? "Reservando..." : "Generar reserva"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
