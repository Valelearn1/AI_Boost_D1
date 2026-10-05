package com.example.demo.expense;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ExpenseRequest(
        @NotNull(message = "L'importo è obbligatorio")
        @Positive(message = "L'importo deve essere maggiore di zero")
        @DecimalMax(value = "99999999.99", message = "L'importo è troppo grande")
        @Digits(integer = 12, fraction = 2, message = "L'importo può avere al massimo 2 decimali")
        BigDecimal amount,

        @NotNull(message = "La data è obbligatoria")
        LocalDate date,

        @Size(max = 100, message = "La descrizione può avere al massimo 100 caratteri")
        String description,

        @NotNull(message = "La categoria è obbligatoria")
        Long categoryId) {

    /** Spazi esterni tolti prima della validazione: il limite di 100 caratteri vale sul testo vero. */
    public ExpenseRequest {
        description = description == null ? null : description.strip();
    }
}
