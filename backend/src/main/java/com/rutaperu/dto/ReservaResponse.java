package com.rutaperu.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ReservaResponse(
        Integer idReserva,
        String servicioNombre,
        String tipoServicio,
        LocalDate fechaInicio,
        LocalDate fechaFin,
        Integer numeroParticipantes,
        BigDecimal montoTotal,
        String estado,
        LocalDateTime fechaCreacion
) {}
