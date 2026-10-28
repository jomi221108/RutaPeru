package com.rutaperu.controller;

import com.rutaperu.dto.AuthResponse;
import com.rutaperu.dto.LoginRequest;
import com.rutaperu.dto.RegistroRequest;
import com.rutaperu.model.Usuario;
import com.rutaperu.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

/**
 * Sprint 1: Autenticación de Usuarios.
 * Corresponde al Diagrama de Secuencia (3.1.3) — endpoints /api/auth/registro y /api/auth/login.
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"})
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/registro")
    public ResponseEntity<AuthResponse> registrar(@Valid @RequestBody RegistroRequest request,
                                                    HttpServletRequest httpRequest) {
        try {
            Usuario usuario = authService.registrar(request, httpRequest.getRemoteAddr());
            AuthResponse respuesta = AuthResponse.ok(
                    "Registro exitoso. Ya puedes iniciar sesión.",
                    usuario.getNombreUsuario(),
                    usuario.getPersona().getNombreCompleto(),
                    usuario.getRol().getNombreRol());
            return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(AuthResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> iniciarSesion(@Valid @RequestBody LoginRequest request,
                                                        HttpServletRequest httpRequest) {
        Optional<Usuario> usuarioOpt = authService.iniciarSesion(request, httpRequest.getRemoteAddr());

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(AuthResponse.error("Usuario o contraseña incorrectos."));
        }

        Usuario usuario = usuarioOpt.get();
        AuthResponse respuesta = AuthResponse.ok(
                "Inicio de sesión exitoso.",
                usuario.getNombreUsuario(),
                usuario.getPersona() != null ? usuario.getPersona().getNombreCompleto() : usuario.getNombreUsuario(),
                usuario.getRol().getNombreRol());
        return ResponseEntity.ok(respuesta);
    }
}
