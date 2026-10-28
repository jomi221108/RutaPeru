import axios from "axios";

// URL base del backend Spring Boot (Sprint 1: solo autenticación).
// En un entorno local por defecto el backend corre en el puerto 8080.
const API_BASE_URL = "http://localhost:8080/api/auth";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Registra un nuevo usuario.
 * @param {{nombres:string, apellidos:string, tipoDocumento:string, numeroDocumento:string,
 *          direccion:string, nombreUsuario:string, clave:string}} datos
 */
export async function registrarUsuario(datos) {
  const respuesta = await api.post("/registro", datos);
  return respuesta.data;
}

/**
 * Inicia sesión con nombre de usuario y clave.
 * @param {{nombreUsuario:string, clave:string}} credenciales
 */
export async function iniciarSesion(credenciales) {
  const respuesta = await api.post("/login", credenciales);
  return respuesta.data;
}

export default api;
