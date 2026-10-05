package com.example.demo.budget;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.context.annotation.Import;

import java.math.BigDecimal;
import java.time.YearMonth;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Import(BudgetService.class)
class BudgetServiceTest {

    static final YearMonth OCTOBER = YearMonth.of(2026, 10);

    @Autowired
    BudgetService service;

    @Autowired
    MonthlyBudgetRepository budgets;

    @Test
    void usesTheBudgetOfTheMonthItself() {
        budgets.save(new MonthlyBudget("2026-09", new BigDecimal("1200.00")));
        budgets.save(new MonthlyBudget("2026-10", new BigDecimal("1300.00")));

        BudgetResponse result = service.effective(OCTOBER);

        assertThat(result.month()).isEqualTo("2026-10");
        assertThat(result.amount()).isEqualByComparingTo("1300.00");
        assertThat(result.sourceMonth()).isEqualTo("2026-10");
    }

    @Test
    void inheritsTheMostRecentEarlierBudget() {
        budgets.save(new MonthlyBudget("2026-07", new BigDecimal("900.00")));
        budgets.save(new MonthlyBudget("2026-09", new BigDecimal("1200.00")));

        BudgetResponse result = service.effective(OCTOBER);

        assertThat(result.amount()).isEqualByComparingTo("1200.00");
        assertThat(result.sourceMonth()).isEqualTo("2026-09");
    }

    @Test
    void neverInheritsFromLaterMonths() {
        budgets.save(new MonthlyBudget("2026-12", new BigDecimal("1500.00")));

        BudgetResponse result = service.effective(OCTOBER);

        assertThat(result.month()).isEqualTo("2026-10");
        assertThat(result.amount()).isNull();
        assertThat(result.sourceMonth()).isNull();
    }

    @Test
    void setCreatesThenUpdatesTheBudgetOfTheMonth() {
        service.set(OCTOBER, new BigDecimal("1000.00"));
        BudgetResponse updated = service.set(OCTOBER, new BigDecimal("1100.00"));

        assertThat(updated.amount()).isEqualByComparingTo("1100.00");
        assertThat(updated.sourceMonth()).isEqualTo("2026-10");
        assertThat(budgets.count()).isEqualTo(1);
    }

    @Test
    void removeFallsBackToTheInheritedBudget() {
        budgets.save(new MonthlyBudget("2026-09", new BigDecimal("1200.00")));
        service.set(OCTOBER, new BigDecimal("1300.00"));

        service.remove(OCTOBER);

        assertThat(service.effective(OCTOBER).sourceMonth()).isEqualTo("2026-09");
    }

    @Test
    void removeWithoutOwnBudgetDoesNothing() {
        budgets.save(new MonthlyBudget("2026-09", new BigDecimal("1200.00")));

        service.remove(OCTOBER);

        assertThat(budgets.count()).isEqualTo(1);
    }
}
