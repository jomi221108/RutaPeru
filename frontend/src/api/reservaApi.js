import axios from "axios";

const apiHost = window.location.hostname === "127.0.0.1" ? "127.0.0.1" : "localhost";
const api = axios.create({ baseURL: `http://${apiHost}:8080/api/reservas` });

function conCredenciales(credenciales) {
  return { auth: credenciales };
}

/** HU.06 — Genera una reserva (alcance parcial: queda "Pendiente de pago"). */
export async function crearReserva(credenciales, datos) {
  const respuesta = await api.post("", datos, conCredenciales(credenciales));
  return respuesta.data;
}

/** Lista las reservas del turista autenticado. */
export async function listarMisReservas(credenciales) {
  const respuesta = await api.get("/mias", conCredenciales(credenciales));
  return respuesta.data;
}
