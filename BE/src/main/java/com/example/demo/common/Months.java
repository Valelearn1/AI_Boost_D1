package com.example.demo.common;

import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.regex.Pattern;

public final class Months {

    /** Anno a 4 cifre: YearMonth accetterebbe anche "+10000-01", che non entra nella colonna e rompe l'ordinamento. */
    private static final Pattern FORMAT = Pattern.compile("\\d{4}-\\d{2}");

    private Months() {
    }

    public static YearMonth parse(String value) {
        if (value == null || !FORMAT.matcher(value).matches()) {
            throw new InvalidMonthException(null);
        }
        try {
            return YearMonth.parse(value);
        } catch (DateTimeParseException e) {
            throw new InvalidMonthException(value);
        }
    }
}
