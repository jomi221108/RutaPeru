package com.rutaperu.service;

import com.rutaperu.dto.AdminRolResponse;
import com.rutaperu.dto.AdminUsuarioRequest;
import com.rutaperu.dto.AdminUsuarioResponse;
import com.rutaperu.model.Persona;
import com.rutaperu.model.Rol;
import com.rutaperu.model.Usuario;
import com.rutaperu.repository.PersonaRepository;
import com.rutaperu.repository.RolRepository;
import com.rutaperu.repository.UsuarioRepository;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class AdminUsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PersonaRepository personaRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUsuarioService(UsuarioRepository usuarioRepository,
                               PersonaRepository personaRepository,
                               RolRepository rolRepository,
                               PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.personaRepository = personaRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<AdminUsuarioResponse> listarUsuarios() {
        return usuarioRepository.findAll(Sort.by("nombreUsuario")).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AdminRolResponse> listarRoles() {
        return rolRepository.findAll(Sort.by("nombreRol")).stream()
                .filter(rol -> "Activo".equalsIgnoreCase(rol.getEstado()))
                .map(rol -> new AdminRolResponse(rol.getIdRol(), rol.getNombreRol()))
                .toList();
    }

    @Transactional
    public AdminUsuarioResponse crear(AdminUsuarioRequest request) {
        ReglaEdad.validar(request.fechaNacimiento());
        if (usuarioRepository.existsByNombreUsuario(request.nombreUsuario())) {
            throw new IllegalArgumentException("Ese nombre de usuario ya está en uso.");
        }
        if (request.clave() == null || request.clave().isBlank()) {
            throw new IllegalArgumentException("La contraseña es obligatoria.");
        }
        validarClave(request.clave());
        validarEstado(request.estado());
        validarDocumentoDisponible(request.tipoDocumento(), request.numeroDocumento(), null);

        Persona persona = new Persona();
        actualizarPersona(persona, request);
        persona.setFechaRegistro(LocalDate.now());
        persona.setFechaNacimiento(request.fechaNacimiento());
        persona = personaRepository.save(persona);

        Usuario usuario = new Usuario();
        usuario.setPersona(persona);
        usuario.setNombreUsuario(request.nombreUsuario());
        usuario.setClave(passwordEncoder.encode(request.clave()));
        usuario.setRol(obtenerRol(request.idRol()));
        usuario.setEstado(normalizarEstado(request.estado()));
        usuario.setFechaCreacion(LocalDate.now());
        return toResponse(usuarioRepository.save(usuario));
    }

    @Transactional
    public AdminUsuarioResponse actualizar(Integer id, AdminUsuarioRequest request, String actor) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("No se encontró el usuario."));
        if (!usuario.getNombreUsuario().equals(request.nombreUsuario())
                && usuarioRepository.existsByNombreUsuario(request.nombreUsuario())) {
            throw new IllegalArgumentException("Ese nombre de usuario ya está en uso.");
        }
        validarEstado(request.estado());
        if (request.fechaNacimiento() != null) {
            ReglaEdad.validar(request.fechaNacimiento());
        }
        if (request.clave() != null && !request.clave().isBlank()) {
            validarClave(request.clave());
        }

        Rol nuevoRol = obtenerRol(request.idRol());
        String nuevoEstado = normalizarEstado(request.estado());
        validarAdministradoresActivos(usuario, nuevoRol, nuevoEstado, actor);

        Persona persona = usuario.getPersona();
        if (persona == null) {
            persona = new Persona();
            persona.setFechaRegistro(LocalDate.now());
            usuario.setPersona(persona);
        }
        validarDocumentoDisponible(request.tipoDocumento(), request.numeroDocumento(), persona.getIdPersona());
        actualizarPersona(persona, request);
        if (request.fechaNacimiento() != null) {
            persona.setFechaNacimiento(request.fechaNacimiento());
        }
        personaRepository.save(persona);

        usuario.setNombreUsuario(request.nombreUsuario());
        usuario.setRol(nuevoRol);
        usuario.setEstado(nuevoEstado);
        if (request.clave() != null && !request.clave().isBlank()) {
            usuario.setClave(passwordEncoder.encode(request.clave()));
        }
        return toResponse(usuarioRepository.save(usuario));
    }

    @Transactional
    public void eliminar(Integer id, String actor) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("No se encontró el usuario."));
        validarAdministradoresActivos(usuario, usuario.getRol(), "Inactivo", actor);
        usuario.setEstado("Inactivo");
        usuarioRepository.save(usuario);
    }

    private Rol obtenerRol(Integer idRol) {
        Rol rol = rolRepository.findById(idRol)
                .orElseThrow(() -> new IllegalArgumentException("El rol seleccionado no existe."));
        if (!"Activo".equalsIgnoreCase(rol.getEstado())) {
            throw new IllegalArgumentException("El rol seleccionado está inactivo.");
        }
        return rol;
    }

    private void validarDocumentoDisponible(String tipo, String numero, Integer idPersonaActual) {
        personaRepository.findByTipoDocumentoAndNumeroDocumento(tipo, numero)
                .filter(persona -> !persona.getIdPersona().equals(idPersonaActual))
                .ifPresent(persona -> {
                    throw new IllegalArgumentException("Ese documento ya está asociado a otra persona.");
                });
    }

    private void validarAdministradoresActivos(Usuario usuario, Rol nuevoRol, String nuevoEstado, String actor) {
        boolean eraAdminActivo = "Administrador".equals(usuario.getRol().getNombreRol())
                && "Activo".equalsIgnoreCase(usuario.getEstado());
        boolean seguiraAdminActivo = "Administrador".equals(nuevoRol.getNombreRol())
                && "Activo".equalsIgnoreCase(nuevoEstado);
        if (usuario.getNombreUsuario().equals(actor) && eraAdminActivo && !seguiraAdminActivo) {
            throw new IllegalArgumentException("No puedes desactivar ni cambiar el rol de tu propia cuenta.");
        }
        if (eraAdminActivo && !seguiraAdminActivo
                && usuarioRepository.countByRol_NombreRolAndEstadoIgnoreCase("Administrador", "Activo") <= 1) {
            throw new IllegalArgumentException("Debe quedar al menos un administrador activo.");
        }
    }

    private void validarEstado(String estado) {
        if (!"Activo".equalsIgnoreCase(estado) && !"Inactivo".equalsIgnoreCase(estado)) {
            throw new IllegalArgumentException("El estado debe ser Activo o Inactivo.");
        }
    }

    private String normalizarEstado(String estado) {
        return "Activo".equalsIgnoreCase(estado) ? "Activo" : "Inactivo";
    }

    private void validarClave(String clave) {
        if (clave.length() < 6 || clave.length() > 72) {
            throw new IllegalArgumentException("La contraseña debe tener entre 6 y 72 caracteres.");
        }
    }

    private void actualizarPersona(Persona persona, AdminUsuarioRequest request) {
        persona.setNombres(request.nombres());
        persona.setApellidos(request.apellidos());
        persona.setTipoDocumento(request.tipoDocumento());
        persona.setNumeroDocumento(request.numeroDocumento());
        persona.setDireccion(request.direccion());
    }

    private AdminUsuarioResponse toResponse(Usuario usuario) {
        Persona persona = usuario.getPersona();
        return new AdminUsuarioResponse(
                usuario.getIdUsuario(),
                persona == null ? "" : persona.getNombres(),
                persona == null ? "" : persona.getApellidos(),
                persona == null ? "" : persona.getTipoDocumento(),
                persona == null ? "" : persona.getNumeroDocumento(),
                persona == null ? null : persona.getFechaNacimiento(),
                persona == null ? "" : persona.getDireccion(),
                usuario.getNombreUsuario(),
                usuario.getRol().getIdRol(),
                usuario.getRol().getNombreRol(),
                usuario.getEstado(),
                usuario.getFechaCreacion());
    }
}