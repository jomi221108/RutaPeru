package com.rutaperu.controller;

import com.rutaperu.dto.AdminRolResponse;
import com.rutaperu.dto.AdminUsuarioRequest;
import com.rutaperu.dto.AdminUsuarioResponse;
import com.rutaperu.service.AdminUsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminUsuarioController {

    private final AdminUsuarioService adminUsuarioService;

    public AdminUsuarioController(AdminUsuarioService adminUsuarioService) {
        this.adminUsuarioService = adminUsuarioService;
    }

    @GetMapping("/usuarios")
    public List<AdminUsuarioResponse> listarUsuarios() {
        return adminUsuarioService.listarUsuarios();
    }

    @GetMapping("/roles")
    public List<AdminRolResponse> listarRoles() {
        return adminUsuarioService.listarRoles();
    }

    @PostMapping("/usuarios")
    public ResponseEntity<?> crear(@Valid @RequestBody AdminUsuarioRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(adminUsuarioService.crear(request));
        } catch (IllegalArgumentException error) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", error.getMessage()));
        }
    }

    @PutMapping("/usuarios/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id,
                                        @Valid @RequestBody AdminUsuarioRequest request,
                                        Authentication authentication) {
        try {
            return ResponseEntity.ok(adminUsuarioService.actualizar(id, request, authentication.getName()));
        } catch (IllegalArgumentException error) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", error.getMessage()));
        }
    }

    @DeleteMapping("/usuarios/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id, Authentication authentication) {
        try {
            adminUsuarioService.eliminar(id, authentication.getName());
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException error) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", error.getMessage()));
        }
    }
}