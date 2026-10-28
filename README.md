# RutaPerú

Sistema web de búsqueda y reserva integral de servicios turísticos a nivel
nacional. Proyecto del curso Curso Integrador I: Sistemas - Software (VII
ciclo), desarrollado bajo el marco de trabajo SCRUM.

## Stack

- **Backend:** Java 21, Spring Boot 3.3.4, Spring Data JPA, Spring Security, MySQL.
- **Frontend:** React + Vite.

## Instalación local

1. **Base de datos:** ejecutar `database/rutaperu_db.sql` en MySQL 8.x.
2. **Backend:** configurar `backend/src/main/resources/application.properties`
   con las credenciales del paso anterior y ejecutar `mvn spring-boot:run`
   desde `backend/` (queda escuchando en `http://localhost:8080`).
3. **Frontend:** desde `frontend/`, ejecutar `npm install` y luego `npm run dev`
   (disponible en `http://localhost:5173`).

## Reglas de negocio

- El mercado objetivo son personas de 18 a 65 años; el registro valida ese
  rango de edad (mínimo y máximo).

## Avance del proyecto

- **Sprint 1 — Autenticación de Usuarios:** registro e inicio de sesión de
  turistas, con validación de rango de edad.
- **Panel de administración de usuarios:** gestión (alta, edición, baja) de
  cuentas y roles por parte del Administrador.
- **Sprint 2 — Búsqueda y Reserva de Servicios Turísticos:** en planificación.
