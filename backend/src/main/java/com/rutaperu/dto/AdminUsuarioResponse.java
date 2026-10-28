package com.rutaperu.dto;

import java.time.LocalDate;

public record AdminUsuarioResponse(
        Integer idUsuario,
        String nombres,
        String apellidos,
        String tipoDocumento,
        String numeroDocumento,
        LocalDate fechaNacimiento,
        String direccion,
        String nombreUsuario,
        Integer idRol,
        String rol,
        String estado,
        LocalDate fechaCreacion
) {}