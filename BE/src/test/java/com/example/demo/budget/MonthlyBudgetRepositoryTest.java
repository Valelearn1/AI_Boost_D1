package com.example.demo.budget;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class MonthlyBudgetRepositoryTest {

    @Autowired
    MonthlyBudgetRepository budgets;

    @BeforeEach
    void setUp() {
        budgets.save(new MonthlyBudget("2026-08", new BigDecimal("900.00")));
        budgets.save(new MonthlyBudget("2026-09", new BigDecimal("1200.00")));
        budgets.save(new MonthlyBudget("2026-12", new BigDecimal("1500.00")));
    }

    @Test
    void findsTheBudgetOfTheMonth() {
        assertThat(budgets.findByMonth("2026-09")).get()
                .extracting(MonthlyBudget::getAmount).isEqualTo(new BigDecimal("1200.00"));
        assertThat(budgets.findByMonth("2026-10")).isEmpty();
    }

    @Test
    void findsTheMostRecentEarlierBudgetIgnoringLaterOnes() {
        assertThat(budgets.findFirstByMonthLessThanOrderByMonthDesc("2026-10")).get()
                .extracting(MonthlyBudget::getMonth).isEqualTo("2026-09");
    }

    @Test
    void findsNothingBeforeTheFirstBudget() {
        assertThat(budgets.findFirstByMonthLessThanOrderByMonthDesc("2026-08")).isEmpty();
    }
}
