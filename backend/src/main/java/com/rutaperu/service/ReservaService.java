package com.rutaperu.service;

import com.rutaperu.dto.ReservaRequest;
import com.rutaperu.dto.ReservaResponse;
import com.rutaperu.model.Reserva;
import com.rutaperu.model.Servicio;
import com.rutaperu.model.Usuario;
import com.rutaperu.repository.ReservaRepository;
import com.rutaperu.repository.ServicioRepository;
import com.rutaperu.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Sprint 2: Búsqueda y Reserva de Servicios — HU.05 (disponibilidad) y
 * HU.06 (generar la reserva). Alcance parcial: la reserva queda en estado
 * "Pendiente de pago"; el flujo de pago se implementa en el Sprint 4.
 */
@Service
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final ServicioRepository servicioRepository;
    private final UsuarioRepository usuarioRepository;

    public ReservaService(ReservaRepository reservaRepository,
                           ServicioRepository servicioRepository,
                           UsuarioRepository usuarioRepository) {
        this.reservaRepository = reservaRepository;
        this.servicioRepository = servicioRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public ReservaResponse crear(ReservaRequest request, String nombreUsuarioAutenticado) {
        Servicio servicio = servicioRepository.findById(request.idServicio())
                .filter(s -> "Publicado".equalsIgnoreCase(s.getEstado()))
                .orElseThrow(() -> new IllegalArgumentException("El servicio no existe o ya no está disponible."));

        if (request.numeroParticipantes() < 1 || request.numeroParticipantes() > servicio.getCapacidad()) {
            throw new IllegalArgumentException(
                    "El número de participantes debe estar entre 1 y " + servicio.getCapacidad() + ".");
        }
        if (request.fechaInicio().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("La fecha de inicio no puede ser anterior a hoy.");
        }
        if (request.fechaFin() != null && request.fechaFin().isBefore(request.fechaInicio())) {
            throw new IllegalArgumentException("La fecha de fin no puede ser anterior a la fecha de inicio.");
        }

        Usuario usuario = usuarioRepository.findByNombreUsuario(nombreUsuarioAutenticado)
                .orElseThrow(() -> new IllegalArgumentException("No se encontró el usuario autenticado."));

        long unidades = unidadesDeCobro(request.fechaInicio(), request.fechaFin());
        BigDecimal montoTotal = servicio.getPrecio()
                .multiply(BigDecimal.valueOf(request.numeroParticipantes()))
                .multiply(BigDecimal.valueOf(unidades));

        Reserva reserva = new Reserva();
        reserva.setUsuario(usuario);
        reserva.setServicio(servicio);
        reserva.setFechaInicio(request.fechaInicio());
        reserva.setFechaFin(request.fechaFin());
        reserva.setNumeroParticipantes(request.numeroParticipantes());
        reserva.setMontoTotal(montoTotal);
        reserva.setEstado("Pendiente de pago");
        reserva = reservaRepository.save(reserva);

        return toResponse(reserva);
    }

    @Transactional(readOnly = true)
    public List<ReservaResponse> listarPorUsuario(String nombreUsuario) {
        return reservaRepository.findByUsuario_NombreUsuarioOrderByFechaCreacionDesc(nombreUsuario).stream()
                .map(this::toResponse)
                .toList();
    }

    /** Hospedaje cobra por noche; Tour y Transporte son una tarifa única por salida. */
    private long unidadesDeCobro(LocalDate fechaInicio, LocalDate fechaFin) {
        if (fechaFin == null || !fechaFin.isAfter(fechaInicio)) {
            return 1;
        }
        return ChronoUnit.DAYS.between(fechaInicio, fechaFin);
    }

    private ReservaResponse toResponse(Reserva reserva) {
        return new ReservaResponse(
                reserva.getIdReserva(),
                reserva.getServicio().getNombre(),
                reserva.getServicio().getTipoServicio(),
                reserva.getFechaInicio(),
                reserva.getFechaFin(),
                reserva.getNumeroParticipantes(),
                reserva.getMontoTotal(),
                reserva.getEstado(),
                reserva.getFechaCreacion());
    }
}
