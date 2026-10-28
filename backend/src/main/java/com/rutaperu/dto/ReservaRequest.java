package com.rutaperu.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record ReservaRequest(
        @NotNull(message = "Debe indicar el servicio a reservar") Integer idServicio,
        @NotNull(message = "La fecha de inicio es obligatoria") LocalDate fechaInicio,
        LocalDate fechaFin,
        @NotNull(message = "El número de participantes es obligatorio")
        @Min(value = 1, message = "Debe haber al menos 1 participante")
        Integer numeroParticipantes
) {}
