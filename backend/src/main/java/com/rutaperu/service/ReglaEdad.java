package com.rutaperu.service;

import java.time.LocalDate;
import java.time.Period;

final class ReglaEdad {

    private ReglaEdad() {}

    static void validar(LocalDate fechaNacimiento) {
        if (fechaNacimiento == null) {
            throw new IllegalArgumentException("La fecha de nacimiento es obligatoria.");
        }
        int edad = Period.between(fechaNacimiento, LocalDate.now()).getYears();
        if (fechaNacimiento.isAfter(LocalDate.now()) || edad < 18 || edad > 65) {
            throw new IllegalArgumentException("Para registrarte debes tener entre 18 y 65 años.");
        }
    }
}