package com.rutaperu.repository;

import com.rutaperu.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    Optional<Usuario> findByNombreUsuario(String nombreUsuario);
    boolean existsByNombreUsuario(String nombreUsuario);
    long countByRol_NombreRolAndEstadoIgnoreCase(String nombreRol, String estado);
}
