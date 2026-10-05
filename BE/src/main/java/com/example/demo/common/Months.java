package com.example.demo.common;

import java.time.YearMonth;
import java.time.format.DateTimeParseException;

public final class Months {

    private Months() {
    }

    public static YearMonth parse(String value) {
        if (value == null) {
            throw new InvalidMonthException(null);
        }
        try {
            return YearMonth.parse(value);
        } catch (DateTimeParseException e) {
            throw new InvalidMonthException(value);
        }
    }
}
