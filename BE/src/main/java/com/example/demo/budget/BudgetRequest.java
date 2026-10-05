package com.example.demo.budget;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record BudgetRequest(
        @NotNull(message = "Il budget è obbligatorio")
        @Positive(message = "Il budget deve essere maggiore di zero")
        @DecimalMax(value = "99999999.99", message = "Il budget è troppo grande")
        @Digits(integer = 12, fraction = 2, message = "Il budget può avere al massimo 2 decimali")
        BigDecimal amount) {
}
