package com.rutaperu.repository;

import com.rutaperu.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReservaRepository extends JpaRepository<Reserva, Integer> {
    List<Reserva> findByUsuario_NombreUsuarioOrderByFechaCreacionDesc(String nombreUsuario);
}
