package com.example.demo.expense;

import com.example.demo.category.Category;
import com.example.demo.category.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class ExpenseRepositoryTest {

    static final LocalDate OCT_1 = LocalDate.of(2026, 10, 1);
    static final LocalDate OCT_31 = LocalDate.of(2026, 10, 31);

    @Autowired
    CategoryRepository categories;

    @Autowired
    ExpenseRepository expenses;

    Category casa;
    Category spesa;

    @BeforeEach
    void setUp() {
        casa = categories.save(new Category("Casa", "#6CCBFF"));
        spesa = categories.save(new Category("Spesa", "#7EE08A"));
        expenses.save(new Expense(new BigDecimal("10.00"), LocalDate.of(2026, 9, 30), "Fine settembre", spesa));
        expenses.save(new Expense(new BigDecimal("650.00"), OCT_1, "Affitto", casa));
        expenses.save(new Expense(new BigDecimal("46.80"), LocalDate.of(2026, 10, 5), "Esselunga", spesa));
        expenses.save(new Expense(new BigDecimal("18.60"), OCT_31, "Mercato", spesa));
        expenses.save(new Expense(new BigDecimal("5.00"), LocalDate.of(2026, 11, 1), "Inizio novembre", casa));
    }

    @Test
    void findsOnlyTheMonthIncludingFirstAndLastDayNewestFirst() {
        List<Expense> october = expenses.findByDateBetweenOrderByDateDescIdDesc(OCT_1, OCT_31);

        assertThat(october).extracting(Expense::getDescription)
                .containsExactly("Mercato", "Esselunga", "Affitto");
    }

    @Test
    void ordersSameDayExpensesByMostRecentlyInserted() {
        expenses.save(new Expense(new BigDecimal("3.20"), LocalDate.of(2026, 10, 5), "Caffè e brioche", spesa));

        List<Expense> october = expenses.findByDateBetweenOrderByDateDescIdDesc(OCT_1, OCT_31);

        assertThat(october).extracting(Expense::getDescription)
                .containsExactly("Mercato", "Caffè e brioche", "Esselunga", "Affitto");
    }

    @Test
    void sumsTheMonthPerCategoryHighestFirst() {
        List<CategoryTotal> totals = expenses.totalsPerCategory(OCT_1, OCT_31);

        assertThat(totals).extracting(CategoryTotal::name).containsExactly("Casa", "Spesa");
        assertThat(totals.get(0).categoryId()).isEqualTo(casa.getId());
        assertThat(totals.get(0).color()).isEqualTo("#6CCBFF");
        assertThat(totals.get(0).total()).isEqualByComparingTo("650.00");
        assertThat(totals.get(1).total()).isEqualByComparingTo("65.40");
    }

    @Test
    void returnsNoTotalsForAnEmptyMonth() {
        assertThat(expenses.totalsPerCategory(LocalDate.of(2026, 12, 1), LocalDate.of(2026, 12, 31))).isEmpty();
    }

    @Test
    void countsExpensesPerCategoryAcrossAllMonths() {
        Map<Long, Long> counts = expenses.countPerCategory().stream()
                .collect(Collectors.toMap(CategoryCount::categoryId, CategoryCount::count));

        assertThat(counts).containsEntry(casa.getId(), 2L).containsEntry(spesa.getId(), 3L);
        assertThat(expenses.countByCategoryId(casa.getId())).isEqualTo(2L);
    }
}
