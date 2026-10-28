package com.rutaperu.repository;

import com.rutaperu.model.Servicio;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface ServicioRepository extends JpaRepository<Servicio, Integer> {

    /**
     * HU.03 — Buscar y filtrar servicios turísticos publicados.
     * Cualquier filtro en null se ignora (no restringe la búsqueda).
     */
    @Query("select s from Servicio s where s.estado = 'Publicado' "
            + "and (:tipoServicio is null or s.tipoServicio = :tipoServicio) "
            + "and (:ubicacion is null or lower(s.ubicacion) like lower(concat('%', :ubicacion, '%'))) "
            + "and (:precioMax is null or s.precio <= :precioMax) "
            + "order by s.ubicacion, s.precio")
    List<Servicio> buscar(@Param("tipoServicio") String tipoServicio,
                           @Param("ubicacion") String ubicacion,
                           @Param("precioMax") BigDecimal precioMax);
}
