import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { iniciarSesion } from "../api/authApi";
import { useAuth } from "../auth/AuthContext";

function extraerMensajeError(error) {
  if (error.response && error.response.data && error.response.data.mensaje) {
    return error.response.data.mensaje;
  }
  if (error.request) {
    return "No se pudo conectar con el servidor. Verifica que el backend esté corriendo en http://localhost:8080.";
  }
  return "Ocurrió un error inesperado. Intenta nuevamente.";
}

export default function Login() {
  const navigate = useNavigate();
  const { guardarSesion } = useAuth();
  const [form, setForm] = useState({ nombreUsuario: "", clave: "" });
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  function manejarCambio(evento) {
    const { name, value } = evento.target;
    setForm((anterior) => ({ ...anterior, [name]: value }));
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setError("");
    setCargando(true);
    try {
      const respuesta = await iniciarSesion(form);
      if (respuesta.exito) {
        guardarSesion(respuesta, {
          username: form.nombreUsuario,
          password: form.clave,
        });
        if (respuesta.rol === "Administrador") {
          navigate("/admin/usuarios");
          return;
        }
        navigate("/bienvenida", {
          state: {
            nombreUsuario: respuesta.nombreUsuario,
            nombreCompleto: respuesta.nombreCompleto,
            rol: respuesta.rol,
          },
        });
      } else {
        setError(respuesta.mensaje || "Usuario o contraseña incorrectos.");
      }
    } catch (err) {
      setError(extraerMensajeError(err));
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="pagina-auth">
      <div className="tarjeta-auth">
        <div className="marca">
          <span className="marca__icono">RP</span>
          <span className="marca__nombre">RutaPerú</span>
        </div>
        <h1>Iniciar sesión</h1>
        <p className="tarjeta-auth__subtitulo">
          Ingresa tus credenciales para acceder a tu cuenta.
        </p>

        {error && <div className="mensaje mensaje--error">{error}</div>}

        <form onSubmit={manejarEnvio}>
          <div className="campo">
            <label htmlFor="nombreUsuario">Usuario</label>
            <input
              id="nombreUsuario"
              name="nombreUsuario"
              type="text"
              autoComplete="username"
              value={form.nombreUsuario}
              onChange={manejarCambio}
              required
            />
          </div>
          <div className="campo">
            <label htmlFor="clave">Contraseña</label>
            <input
              id="clave"
              name="clave"
              type="password"
              autoComplete="current-password"
              value={form.clave}
              onChange={manejarCambio}
              required
            />
          </div>
          <button className="boton-primario" type="submit" disabled={cargando}>
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div className="enlace-secundario">
          ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
        </div>
      </div>
    </div>
  );
}
