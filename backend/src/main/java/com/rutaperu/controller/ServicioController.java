package com.rutaperu.controller;

import com.rutaperu.dto.ServicioResponse;
import com.rutaperu.service.ServicioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Sprint 2: Búsqueda y Reserva de Servicios — HU.03 y HU.04.
 * Requiere turista autenticado (ver SecurityConfig: /api/servicios/** => authenticated()).
 */
@RestController
@RequestMapping("/api/servicios")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"})
public class ServicioController {

    private final ServicioService servicioService;

    public ServicioController(ServicioService servicioService) {
        this.servicioService = servicioService;
    }

    @GetMapping
    public List<ServicioResponse> buscar(@RequestParam(required = false) String tipoServicio,
                                          @RequestParam(required = false) String ubicacion,
                                          @RequestParam(required = false) BigDecimal precioMax) {
        return servicioService.buscar(tipoServicio, ubicacion, precioMax);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerDetalle(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(servicioService.obtenerDetalle(id));
        } catch (IllegalArgumentException error) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", error.getMessage()));
        }
    }
}
