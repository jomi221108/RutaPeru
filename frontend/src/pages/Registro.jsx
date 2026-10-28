import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registrarUsuario } from "../api/authApi";

const ESTADO_INICIAL = {
  nombres: "",
  apellidos: "",
  fechaNacimiento: "",
  tipoDocumento: "DNI",
  numeroDocumento: "",
  direccion: "",
  nombreUsuario: "",
  clave: "",
  confirmarClave: "",
};

const hoy = new Date();
const FECHA_HOY = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;

function edadEnAnios(fechaNacimiento) {
  if (!fechaNacimiento) return null;
  const [anio, mes, dia] = fechaNacimiento.split("-").map(Number);
  const hoy = new Date();
  let edad = hoy.getFullYear() - anio;
  const cumpleEsteAnio = new Date(hoy.getFullYear(), mes - 1, dia);
  if (hoy < cumpleEsteAnio) edad -= 1;
  return edad;
}

function extraerMensajeError(error) {
  if (error.response && error.response.data && error.response.data.mensaje) {
    return error.response.data.mensaje;
  }
  if (error.response && error.response.status === 400 && error.response.data) {
    // Errores de validación de Bean Validation (jakarta.validation)
    const datos = error.response.data;
    if (typeof datos === "object") {
      const primerCampo = Object.values(datos)[0];
      if (primerCampo) return String(primerCampo);
    }
  }
  if (error.request) {
    return "No se pudo conectar con el servidor. Verifica que el backend esté corriendo en http://localhost:8080.";
  }
  return "Ocurrió un error inesperado. Intenta nuevamente.";
}

export default function Registro() {
  const navigate = useNavigate();
  const [form, setForm] = useState(ESTADO_INICIAL);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [cargando, setCargando] = useState(false);

  function manejarCambio(evento) {
    const { name, value } = evento.target;
    setForm((anterior) => ({ ...anterior, [name]: value }));
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setError("");
    setExito("");

    if (form.clave !== form.confirmarClave) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (form.clave.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    const edad = edadEnAnios(form.fechaNacimiento);
    if (edad === null || edad < 18 || edad > 65) {
      setError("Para registrarte debes tener entre 18 y 65 años.");
      return;
    }

    setCargando(true);
    try {
      const datosRegistro = { ...form };
      delete datosRegistro.confirmarClave;
      const respuesta = await registrarUsuario(datosRegistro);
      if (respuesta.exito) {
        setExito(respuesta.mensaje || "Registro exitoso.");
        setTimeout(() => navigate("/"), 1200);
      } else {
        setError(respuesta.mensaje || "No se pudo completar el registro.");
      }
    } catch (err) {
      setError(extraerMensajeError(err));
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="pagina-auth">
      <div className="tarjeta-auth tarjeta-auth--ancha">
        <div className="marca">
          <span className="marca__icono">RP</span>
          <span className="marca__nombre">RutaPerú</span>
        </div>
        <h1>Crear cuenta</h1>
        <p className="tarjeta-auth__subtitulo">
          Regístrate para empezar a planear tu próximo viaje.
        </p>

        {error && <div className="mensaje mensaje--error">{error}</div>}
        {exito && <div className="mensaje mensaje--exito">{exito}</div>}

        <form onSubmit={manejarEnvio}>
          <div className="fila-doble">
            <div className="campo">
              <label htmlFor="nombres">Nombres</label>
              <input
                id="nombres"
                name="nombres"
                type="text"
                value={form.nombres}
                onChange={manejarCambio}
                required
              />
            </div>
            <div className="campo">
              <label htmlFor="apellidos">Apellidos</label>
              <input
                id="apellidos"
                name="apellidos"
                type="text"
                value={form.apellidos}
                onChange={manejarCambio}
                required
              />
            </div>
          </div>

          <div className="fila-doble">
            <div className="campo">
              <label htmlFor="tipoDocumento">Tipo de documento</label>
              <select
                id="tipoDocumento"
                name="tipoDocumento"
                value={form.tipoDocumento}
                onChange={manejarCambio}
              >
                <option value="DNI">DNI</option>
                <option value="Carné de Extranjería">Carné de Extranjería</option>
                <option value="Pasaporte">Pasaporte</option>
              </select>
            </div>
            <div className="campo">
              <label htmlFor="numeroDocumento">N.° de documento</label>
              <input
                id="numeroDocumento"
                name="numeroDocumento"
                type="text"
                value={form.numeroDocumento}
                onChange={manejarCambio}
                required
              />
            </div>
          </div>

          <div className="campo">
            <label htmlFor="fechaNacimiento">Fecha de nacimiento</label>
            <input
              id="fechaNacimiento"
              name="fechaNacimiento"
              type="date"
              value={form.fechaNacimiento}
              onChange={manejarCambio}
              max={FECHA_HOY}
              required
            />
            <small className="ayuda-campo">El registro está disponible para personas de 18 a 65 años.</small>
          </div>

          <div className="campo">
            <label htmlFor="direccion">Dirección (opcional)</label>
            <input
              id="direccion"
              name="direccion"
              type="text"
              value={form.direccion}
              onChange={manejarCambio}
            />
          </div>

          <div className="campo">
            <label htmlFor="nombreUsuario">Nombre de usuario</label>
            <input
              id="nombreUsuario"
              name="nombreUsuario"
              type="text"
              autoComplete="username"
              value={form.nombreUsuario}
              onChange={manejarCambio}
              minLength={4}
              maxLength={40}
              required
            />
          </div>

          <div className="fila-doble">
            <div className="campo">
              <label htmlFor="clave">Contraseña</label>
              <input
                id="clave"
                name="clave"
                type="password"
                autoComplete="new-password"
                value={form.clave}
                onChange={manejarCambio}
                minLength={6}
                required
              />
            </div>
            <div className="campo">
              <label htmlFor="confirmarClave">Confirmar contraseña</label>
              <input
                id="confirmarClave"
                name="confirmarClave"
                type="password"
                autoComplete="new-password"
                value={form.confirmarClave}
                onChange={manejarCambio}
                minLength={6}
                required
              />
            </div>
          </div>

          <button className="boton-primario" type="submit" disabled={cargando}>
            {cargando ? "Registrando..." : "Registrarme"}
          </button>
        </form>

        <div className="enlace-secundario">
          ¿Ya tienes cuenta? <Link to="/">Inicia sesión</Link>
        </div>
      </div>
    </div>
  );
}
