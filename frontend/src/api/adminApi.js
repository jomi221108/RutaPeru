import axios from "axios";

const apiHost = window.location.hostname === "127.0.0.1" ? "127.0.0.1" : "localhost";
const api = axios.create({ baseURL: `http://${apiHost}:8080/api/admin` });

function conCredenciales(credenciales) {
  return { auth: credenciales };
}

export async function listarUsuarios(credenciales) {
  const respuesta = await api.get("/usuarios", conCredenciales(credenciales));
  return respuesta.data;
}

export async function listarRoles(credenciales) {
  const respuesta = await api.get("/roles", conCredenciales(credenciales));
  return respuesta.data;
}

export async function crearUsuario(credenciales, datos) {
  const respuesta = await api.post("/usuarios", datos, conCredenciales(credenciales));
  return respuesta.data;
}

export async function actualizarUsuario(credenciales, id, datos) {
  const respuesta = await api.put(`/usuarios/${id}`, datos, conCredenciales(credenciales));
  return respuesta.data;
}

export async function eliminarUsuario(credenciales, id) {
  await api.delete(`/usuarios/${id}`, conCredenciales(credenciales));
}