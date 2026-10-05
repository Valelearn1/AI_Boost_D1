package com.example.demo.common;

import java.math.BigDecimal;
import java.math.RoundingMode;

/** Importi in euro: sempre con 2 decimali, come le colonne DECIMAL(10,2). */
public final class Money {

    public static final BigDecimal ZERO = new BigDecimal("0.00");

    private Money() {
    }

    /** Da usare dopo la validazione (che garantisce al massimo 2 decimali): 5 → 5.00. */
    public static BigDecimal cents(BigDecimal amount) {
        return amount.setScale(2, RoundingMode.UNNECESSARY);
    }
}
