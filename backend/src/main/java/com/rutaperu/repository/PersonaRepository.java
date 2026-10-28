package com.rutaperu.repository;

import com.rutaperu.model.Persona;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PersonaRepository extends JpaRepository<Persona, Integer> {
    Optional<Persona> findByTipoDocumentoAndNumeroDocumento(String tipoDocumento, String numeroDocumento);
}
