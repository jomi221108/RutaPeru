package com.rutaperu.service;

import com.rutaperu.dto.ServicioResponse;
import com.rutaperu.model.Servicio;
import com.rutaperu.repository.ServicioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Sprint 2: Búsqueda y Reserva de Servicios — HU.03 (buscar y filtrar) y
 * HU.04 (ver el detalle de cada servicio).
 */
@Service
public class ServicioService {

    private final ServicioRepository servicioRepository;

    public ServicioService(ServicioRepository servicioRepository) {
        this.servicioRepository = servicioRepository;
    }

    @Transactional(readOnly = true)
    public List<ServicioResponse> buscar(String tipoServicio, String ubicacion, BigDecimal precioMax) {
        String tipoNormalizado = (tipoServicio == null || tipoServicio.isBlank()) ? null : tipoServicio;
        String ubicacionNormalizada = (ubicacion == null || ubicacion.isBlank()) ? null : ubicacion;
        return servicioRepository.buscar(tipoNormalizado, ubicacionNormalizada, precioMax).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ServicioResponse obtenerDetalle(Integer idServicio) {
        Servicio servicio = servicioRepository.findById(idServicio)
                .filter(s -> "Publicado".equalsIgnoreCase(s.getEstado()))
                .orElseThrow(() -> new IllegalArgumentException("El servicio no existe o ya no está disponible."));
        return toResponse(servicio);
    }

    private ServicioResponse toResponse(Servicio servicio) {
        return new ServicioResponse(
                servicio.getIdServicio(),
                servicio.getNombre(),
                servicio.getTipoServicio(),
                servicio.getDescripcion(),
                servicio.getUbicacion(),
                servicio.getPrecio(),
                servicio.getCapacidad(),
                servicio.getEstado(),
                servicio.getProveedor().getRazonSocial());
    }
}
