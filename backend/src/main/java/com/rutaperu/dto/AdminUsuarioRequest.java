package com.rutaperu.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record AdminUsuarioRequest(
        @NotBlank @Size(max = 80) String nombres,
        @NotBlank @Size(max = 80) String apellidos,
        @NotBlank @Size(max = 20) String tipoDocumento,
        @NotBlank @Size(max = 20) String numeroDocumento,
        LocalDate fechaNacimiento,
        @Size(max = 150) String direccion,
        @NotBlank @Size(min = 4, max = 40) String nombreUsuario,
        String clave,
        @NotNull Integer idRol,
        @NotBlank @Size(max = 15) String estado
) {}