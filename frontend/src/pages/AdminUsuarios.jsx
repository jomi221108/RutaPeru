import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  actualizarUsuario,
  crearUsuario,
  eliminarUsuario,
  listarRoles,
  listarUsuarios,
} from "../api/adminApi";
import { useAuth } from "../auth/AuthContext";

const hoy = new Date();
const FECHA_HOY = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;

const FORM_VACIO = {
  nombres: "",
  apellidos: "",
  tipoDocumento: "DNI",
  numeroDocumento: "",
  fechaNacimiento: "",
  direccion: "",
  nombreUsuario: "",
  clave: "",
  idRol: "",
  estado: "Activo",
};

function mensajeDeError(error) {
  if (error.response?.data?.mensaje) return error.response.data.mensaje;
  if (error.response?.status === 401 || error.response?.status === 403) {
    return "Tu sesión no tiene permisos de administrador. Inicia sesión nuevamente.";
  }
  return "No se pudo completar la operación. Revisa los datos e inténtalo otra vez.";
}

export default function AdminUsuarios() {
  const navigate = useNavigate();
  const { sesion, cerrarSesion } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [form, setForm] = useState(FORM_VACIO);
  const [editando, setEditando] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    let vigente = true;
    Promise.all([
      listarUsuarios(sesion.credenciales),
      listarRoles(sesion.credenciales),
    ])
      .then(([listaUsuarios, listaRoles]) => {
        if (!vigente) return;
        setUsuarios(listaUsuarios);
        setRoles(listaRoles);
        setForm((actual) => ({
          ...actual,
          idRol: actual.idRol || String(listaRoles.find((rol) => rol.nombreRol === "Turista")?.idRol ?? ""),
        }));
      })
      .catch((err) => {
        if (vigente) setError(mensajeDeError(err));
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => { vigente = false; };
  }, [sesion.credenciales]);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const [listaUsuarios, listaRoles] = await Promise.all([
        listarUsuarios(sesion.credenciales),
        listarRoles(sesion.credenciales),
      ]);
      setUsuarios(listaUsuarios);
      setRoles(listaRoles);
      setForm((actual) => ({
        ...actual,
        idRol: actual.idRol || String(listaRoles.find((rol) => rol.nombreRol === "Turista")?.idRol ?? ""),
      }));
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setCargando(false);
    }
  }, [sesion.credenciales]);

  function abrirNuevo() {
    setEditando(null);
    setForm({
      ...FORM_VACIO,
      idRol: String(roles.find((rol) => rol.nombreRol === "Turista")?.idRol ?? ""),
    });
    setError("");
    setModalAbierto(true);
  }

  function abrirEdicion(usuario) {
    setEditando(usuario);
    setForm({
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      tipoDocumento: usuario.tipoDocumento || "DNI",
      numeroDocumento: usuario.numeroDocumento,
      fechaNacimiento: usuario.fechaNacimiento || "",
      direccion: usuario.direccion || "",
      nombreUsuario: usuario.nombreUsuario,
      clave: "",
      idRol: String(usuario.idRol),
      estado: usuario.estado,
    });
    setError("");
    setModalAbierto(true);
  }

  function cambiarCampo(evento) {
    const { name, value } = evento.target;
    setForm((anterior) => ({ ...anterior, [name]: value }));
  }

  async function guardar(evento) {
    evento.preventDefault();
    setGuardando(true);
    setError("");
    try {
      const datos = { ...form, idRol: Number(form.idRol) };
      if (editando) {
        await actualizarUsuario(sesion.credenciales, editando.idUsuario, datos);
        setAviso("Cambios guardados.");
      } else {
        await crearUsuario(sesion.credenciales, datos);
        setAviso("Usuario creado.");
      }
      setModalAbierto(false);
      await cargarDatos();
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(usuario) {
    const confirmar = window.confirm(
      `¿Eliminar a ${usuario.nombreUsuario}? Se desactivará la cuenta y se conservará su historial.`,
    );
    if (!confirmar) return;
    setError("");
    setAviso("");
    try {
      await eliminarUsuario(sesion.credenciales, usuario.idUsuario);
      setAviso(`La cuenta ${usuario.nombreUsuario} quedó inactiva.`);
      await cargarDatos();
    } catch (err) {
      setError(mensajeDeError(err));
    }
  }

  function salir() {
    cerrarSesion();
    navigate("/");
  }

  const consulta = busqueda.trim().toLocaleLowerCase();
  const visibles = usuarios.filter((usuario) => {
    const coincideTexto = [
      usuario.nombreUsuario,
      usuario.nombres,
      usuario.apellidos,
      usuario.numeroDocumento,
      usuario.rol,
    ].some((valor) => valor?.toLocaleLowerCase().includes(consulta));
    const coincideEstado = filtroEstado === "Todos" || usuario.estado === filtroEstado;
    return coincideTexto && coincideEstado;
  });
  const activos = usuarios.filter((usuario) => usuario.estado === "Activo").length;

  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-marca">
          <span className="marca__icono">RP</span>
          <span>RutaPerú</span>
          <span className="admin-topbar__separador">/</span>
          <span className="admin-topbar__seccion">Administración</span>
        </div>
        <div className="admin-identidad">
          <span className="admin-identidad__usuario">{sesion.usuario.nombreUsuario}</span>
          <span className="admin-identidad__rol">Administrador</span>
          <button className="admin-text-button" type="button" onClick={salir}>Cerrar sesión</button>
        </div>
      </header>

      <section className="admin-content">
        <div className="admin-heading">
          <div>
            <p className="admin-eyebrow">CUENTAS Y ACCESOS</p>
            <h1>Usuarios</h1>
            <p>Administra las cuentas, sus roles y su estado de acceso.</p>
          </div>
          <button className="admin-primary-button" type="button" onClick={abrirNuevo}>
            <span aria-hidden="true">+</span> Crear usuario
          </button>
        </div>

        <div className="admin-summary" aria-label="Resumen de usuarios">
          <div><span>Total de cuentas</span><strong>{usuarios.length}</strong></div>
          <div><span>Activas</span><strong>{activos}</strong></div>
          <div><span>Inactivas</span><strong>{usuarios.length - activos}</strong></div>
        </div>

        {error && <div className="admin-message admin-message--error" role="alert">{error}</div>}
        {aviso && <div className="admin-message admin-message--success" role="status">{aviso}</div>}

        <section className="admin-list" aria-label="Listado de usuarios">
          <div className="admin-list__toolbar">
            <label className="admin-search">
              <span className="sr-only">Buscar usuario</span>
              <input
                type="search"
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
                placeholder="Buscar nombre, usuario o documento"
              />
            </label>
            <label className="admin-filter">
              <span>Estado</span>
              <select value={filtroEstado} onChange={(evento) => setFiltroEstado(evento.target.value)}>
                <option>Todos</option>
                <option>Activo</option>
                <option>Inactivo</option>
              </select>
            </label>
          </div>

          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Documento</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr><td colSpan="5" className="admin-table__empty">Cargando usuarios…</td></tr>
                ) : visibles.length === 0 ? (
                  <tr><td colSpan="5" className="admin-table__empty">No hay usuarios para mostrar.</td></tr>
                ) : visibles.map((usuario) => (
                  <tr key={usuario.idUsuario}>
                    <td>
                      <strong>{usuario.nombreUsuario}</strong>
                      <span className="admin-table__secondary">{usuario.nombres} {usuario.apellidos}</span>
                    </td>
                    <td>{usuario.tipoDocumento} · {usuario.numeroDocumento}</td>
                    <td>{usuario.rol}</td>
                    <td><span className={`admin-status admin-status--${usuario.estado.toLowerCase()}`}>{usuario.estado}</span></td>
                    <td className="admin-actions">
                      <button className="admin-text-button" type="button" onClick={() => abrirEdicion(usuario)}>Editar</button>
                      {usuario.estado === "Activo" && (
                        <button
                          className="admin-text-button admin-text-button--danger"
                          type="button"
                          onClick={() => eliminar(usuario)}
                          disabled={usuario.nombreUsuario === sesion.usuario.nombreUsuario}
                          title={usuario.nombreUsuario === sesion.usuario.nombreUsuario ? "No puedes eliminar tu propia cuenta" : "Eliminar usuario"}
                        >
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <footer className="admin-list__footer">Mostrando {visibles.length} de {usuarios.length} usuarios</footer>
        </section>
      </section>

      {modalAbierto && (
        <div className="admin-modal-backdrop" role="presentation" onMouseDown={(evento) => {
          if (evento.target === evento.currentTarget && !guardando) setModalAbierto(false);
        }}>
          <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="form-title">
            <header className="admin-modal__header">
              <div>
                <p className="admin-eyebrow">GESTIÓN DE CUENTA</p>
                <h2 id="form-title">{editando ? "Editar usuario" : "Crear usuario"}</h2>
              </div>
              <button className="admin-close-button" type="button" onClick={() => setModalAbierto(false)} aria-label="Cerrar">×</button>
            </header>
            <form onSubmit={guardar} className="admin-form">
              <div className="admin-form-grid">
                <label>Nombres<input name="nombres" value={form.nombres} onChange={cambiarCampo} maxLength="80" required /></label>
                <label>Apellidos<input name="apellidos" value={form.apellidos} onChange={cambiarCampo} maxLength="80" required /></label>
                <label>Tipo de documento
                  <select name="tipoDocumento" value={form.tipoDocumento} onChange={cambiarCampo}>
                    <option>DNI</option><option>Carné de Extranjería</option><option>Pasaporte</option>
                  </select>
                </label>
                <label>Número de documento<input name="numeroDocumento" value={form.numeroDocumento} onChange={cambiarCampo} maxLength="20" required /></label>
                <label>Fecha de nacimiento<input name="fechaNacimiento" type="date" value={form.fechaNacimiento} onChange={cambiarCampo} max={FECHA_HOY} required={!editando} /></label>
                <label className="admin-form-grid__wide">Dirección<input name="direccion" value={form.direccion} onChange={cambiarCampo} maxLength="150" /></label>
                <label>Nombre de usuario<input name="nombreUsuario" value={form.nombreUsuario} onChange={cambiarCampo} minLength="4" maxLength="40" required /></label>
                <label>{editando ? "Nueva contraseña (opcional)" : "Contraseña"}<input name="clave" type="password" value={form.clave} onChange={cambiarCampo} minLength="6" maxLength="72" required={!editando} autoComplete="new-password" /></label>
                <label>Rol<select name="idRol" value={form.idRol} onChange={cambiarCampo} required>{roles.map((rol) => <option key={rol.idRol} value={rol.idRol}>{rol.nombreRol}</option>)}</select></label>
                <label>Estado<select name="estado" value={form.estado} onChange={cambiarCampo}><option>Activo</option><option>Inactivo</option></select></label>
              </div>
              {error && <div className="admin-message admin-message--error" role="alert">{error}</div>}
              <footer className="admin-form__actions">
                <button className="admin-secondary-button" type="button" onClick={() => setModalAbierto(false)} disabled={guardando}>Cancelar</button>
                <button className="admin-primary-button" type="submit" disabled={guardando}>{guardando ? "Guardando…" : "Guardar usuario"}</button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}