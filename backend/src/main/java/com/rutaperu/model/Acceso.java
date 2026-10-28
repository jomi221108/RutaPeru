package com.rutaperu.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "acceso")
public class Acceso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_acceso")
    private Integer idAcceso;

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "id_modulo", nullable = false)
    private Modulo modulo;

    @Column(name = "url", length = 120)
    private String url;

    @Column(name = "estado", nullable = false, length = 15)
    private String estado = "Permitido";

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha = LocalDate.now();

    public Acceso() {}

    public Integer getIdAcceso() { return idAcceso; }
    public void setIdAcceso(Integer idAcceso) { this.idAcceso = idAcceso; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public Modulo getModulo() { return modulo; }
    public void setModulo(Modulo modulo) { this.modulo = modulo; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }
}
