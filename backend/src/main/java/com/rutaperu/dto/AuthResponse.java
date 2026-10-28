package com.rutaperu.dto;

public class AuthResponse {

    private boolean exito;
    private String mensaje;
    private String nombreUsuario;
    private String nombreCompleto;
    private String rol;

    public AuthResponse() {}

    public AuthResponse(boolean exito, String mensaje, String nombreUsuario, String nombreCompleto, String rol) {
        this.exito = exito;
        this.mensaje = mensaje;
        this.nombreUsuario = nombreUsuario;
        this.nombreCompleto = nombreCompleto;
        this.rol = rol;
    }

    public static AuthResponse ok(String mensaje, String nombreUsuario, String nombreCompleto, String rol) {
        return new AuthResponse(true, mensaje, nombreUsuario, nombreCompleto, rol);
    }

    public static AuthResponse error(String mensaje) {
        return new AuthResponse(false, mensaje, null, null, null);
    }

    public boolean isExito() { return exito; }
    public void setExito(boolean exito) { this.exito = exito; }

    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }

    public String getNombreUsuario() { return nombreUsuario; }
    public void setNombreUsuario(String nombreUsuario) { this.nombreUsuario = nombreUsuario; }

    public String getNombreCompleto() { return nombreCompleto; }
    public void setNombreCompleto(String nombreCompleto) { this.nombreCompleto = nombreCompleto; }

    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
}
