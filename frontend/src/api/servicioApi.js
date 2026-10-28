import axios from "axios";

const apiHost = window.location.hostname === "127.0.0.1" ? "127.0.0.1" : "localhost";
const api = axios.create({ baseURL: `http://${apiHost}:8080/api/servicios` });

function conCredenciales(credenciales) {
  return { auth: credenciales };
}

/**
 * HU.03 — Busca y filtra servicios turísticos publicados.
 * @param {{username:string, password:string}} credenciales
 * @param {{tipoServicio?:string, ubicacion?:string, precioMax?:number|string}} filtros
 */
export async function buscarServicios(credenciales, filtros = {}) {
  const params = {};
  if (filtros.tipoServicio) params.tipoServicio = filtros.tipoServicio;
  if (filtros.ubicacion) params.ubicacion = filtros.ubicacion;
  if (filtros.precioMax) params.precioMax = filtros.precioMax;
  const respuesta = await api.get("", { ...conCredenciales(credenciales), params });
  return respuesta.data;
}

/** HU.04 — Obtiene el detalle de un servicio. */
export async function obtenerServicio(credenciales, idServicio) {
  const respuesta = await api.get(`/${idServicio}`, conCredenciales(credenciales));
  return respuesta.data;
}
