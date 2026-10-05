package com.example.demo.expense;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ExpenseRequest(
        @NotNull(message = "L'importo è obbligatorio")
        @Positive(message = "L'importo deve essere maggiore di zero")
        @Digits(integer = 8, fraction = 2, message = "L'importo può avere al massimo 2 decimali")
        BigDecimal amount,

        @NotNull(message = "La data è obbligatoria")
        LocalDate date,

        @Size(max = 100, message = "La descrizione può avere al massimo 100 caratteri")
        String description,

        @NotNull(message = "La categoria è obbligatoria")
        Long categoryId) {
}
