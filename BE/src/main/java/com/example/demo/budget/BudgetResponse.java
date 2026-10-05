package com.example.demo.budget;

import java.math.BigDecimal;

/** {@code amount} e {@code sourceMonth} sono null se non c'è budget; sourceMonth ≠ month se ereditato. */
public record BudgetResponse(String month, BigDecimal amount, String sourceMonth) {
}
