package com.rutaperu.controller;

import com.rutaperu.dto.ReservaRequest;
import com.rutaperu.dto.ReservaResponse;
import com.rutaperu.service.ReservaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Sprint 2: Búsqueda y Reserva de Servicios — HU.05 y HU.06 (alcance
 * parcial, sin pago: el flujo de pago se implementa en el Sprint 4).
 */
@RestController
@RequestMapping("/api/reservas")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"})
public class ReservaController {

    private final ReservaService reservaService;

    public ReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    @PostMapping
    public ResponseEntity<?> crear(@Valid @RequestBody ReservaRequest request, Authentication authentication) {
        try {
            ReservaResponse reserva = reservaService.crear(request, authentication.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(reserva);
        } catch (IllegalArgumentException error) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", error.getMessage()));
        }
    }

    @GetMapping("/mias")
    public List<ReservaResponse> listarMias(Authentication authentication) {
        return reservaService.listarPorUsuario(authentication.getName());
    }
}
