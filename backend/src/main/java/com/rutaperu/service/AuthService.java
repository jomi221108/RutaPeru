package com.rutaperu.service;

import com.rutaperu.dto.LoginRequest;
import com.rutaperu.dto.RegistroRequest;
import com.rutaperu.model.*;
import com.rutaperu.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

@Service
public class AuthService {

    private final PersonaRepository personaRepository;
    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final BitacoraRepository bitacoraRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String ROL_POR_DEFECTO = "Turista";

    @Autowired
    public AuthService(PersonaRepository personaRepository,
                        UsuarioRepository usuarioRepository,
                        RolRepository rolRepository,
                        BitacoraRepository bitacoraRepository,
                        PasswordEncoder passwordEncoder) {
        this.personaRepository = personaRepository;
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.bitacoraRepository = bitacoraRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Caso de uso "Registrarse" (ver 3.1.1 Diagrama de Procesos / 3.1.2 Casos de Uso).
     * Crea PERSONA y USUARIO. Lanza IllegalArgumentException si el usuario ya existe.
     */
    @Transactional
    public Usuario registrar(RegistroRequest req, String ipOrigen) {
        ReglaEdad.validar(req.getFechaNacimiento());

        if (usuarioRepository.existsByNombreUsuario(req.getNombreUsuario())) {
            throw new IllegalArgumentException("El nombre de usuario '" + req.getNombreUsuario() + "' ya está en uso.");
        }

        Optional<Persona> personaExistente = personaRepository
                .findByTipoDocumentoAndNumeroDocumento(req.getTipoDocumento(), req.getNumeroDocumento());

        Persona persona = personaExistente.orElseGet(Persona::new);
        persona.setNombres(req.getNombres());
        persona.setApellidos(req.getApellidos());
        persona.setTipoDocumento(req.getTipoDocumento());
        persona.setNumeroDocumento(req.getNumeroDocumento());
        persona.setDireccion(req.getDireccion());
        persona.setFechaNacimiento(req.getFechaNacimiento());
        if (persona.getFechaRegistro() == null) {
            persona.setFechaRegistro(LocalDate.now());
        }
        persona = personaRepository.save(persona);

        Rol rolTurista = rolRepository.findByNombreRol(ROL_POR_DEFECTO)
                .orElseThrow(() -> new IllegalStateException(
                        "No existe el rol '" + ROL_POR_DEFECTO + "'. Verifique que ejecutó rutaperu_db.sql."));

        Usuario usuario = new Usuario();
        usuario.setPersona(persona);
        usuario.setRol(rolTurista);
        usuario.setNombreUsuario(req.getNombreUsuario());
        usuario.setClave(passwordEncoder.encode(req.getClave()));
        usuario.setEstado("Activo");
        usuario.setFechaCreacion(LocalDate.now());
        usuario = usuarioRepository.save(usuario);

        bitacoraRepository.save(new Bitacora(usuario, "REGISTRO", "usuario", ipOrigen));

        return usuario;
    }

    /**
     * Caso de uso "Iniciar sesión" (incluye "Validar Credenciales").
     * Devuelve el Usuario autenticado o Optional.empty() si las credenciales son inválidas.
     */
    @Transactional
    public Optional<Usuario> iniciarSesion(LoginRequest req, String ipOrigen) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByNombreUsuario(req.getNombreUsuario());

        if (usuarioOpt.isEmpty()) {
            return Optional.empty();
        }

        Usuario usuario = usuarioOpt.get();
        boolean credencialesValidas = usuario.autenticar(req.getClave(), passwordEncoder);

        if (!credencialesValidas || !"Activo".equalsIgnoreCase(usuario.getEstado())) {
            return Optional.empty();
        }

        bitacoraRepository.save(new Bitacora(usuario, "LOGIN", "usuario", ipOrigen));
        return Optional.of(usuario);
    }
}
