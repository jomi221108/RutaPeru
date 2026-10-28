package com.rutaperu.dto;

import java.math.BigDecimal;

public record ServicioResponse(
        Integer idServicio,
        String nombre,
        String tipoServicio,
        String descripcion,
        String ubicacion,
        BigDecimal precio,
        Integer capacidad,
        String estado,
        String proveedorRazonSocial
) {}
