package com.example.demo.common;

import org.junit.jupiter.api.Test;

import java.time.YearMonth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class MonthsTest {

    @Test
    void parsesIsoMonth() {
        assertThat(Months.parse("2026-10")).isEqualTo(YearMonth.of(2026, 10));
    }

    @Test
    void rejectsInvalidMonthNumber() {
        assertThatThrownBy(() -> Months.parse("2026-13"))
                .isInstanceOf(InvalidMonthException.class)
                .hasMessage("Mese non valido: «2026-13». Usa il formato AAAA-MM.");
    }

    @Test
    void rejectsWrongOrder() {
        assertThatThrownBy(() -> Months.parse("10-2026")).isInstanceOf(InvalidMonthException.class);
    }

    @Test
    void rejectsExtendedYears() {
        assertThatThrownBy(() -> Months.parse("+10000-01")).isInstanceOf(InvalidMonthException.class);
        assertThatThrownBy(() -> Months.parse("-2026-10")).isInstanceOf(InvalidMonthException.class);
    }

    @Test
    void rejectsNull() {
        assertThatThrownBy(() -> Months.parse(null)).isInstanceOf(InvalidMonthException.class);
    }
}
