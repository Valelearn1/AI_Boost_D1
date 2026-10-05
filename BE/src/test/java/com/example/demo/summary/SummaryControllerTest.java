package com.example.demo.summary;

import com.example.demo.budget.MonthlyBudget;
import com.example.demo.budget.MonthlyBudgetRepository;
import com.example.demo.category.Category;
import com.example.demo.category.CategoryRepository;
import com.example.demo.expense.Expense;
import com.example.demo.expense.ExpenseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class SummaryControllerTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    CategoryRepository categories;

    @Autowired
    ExpenseRepository expenses;

    @Autowired
    MonthlyBudgetRepository budgets;

    Category casa;

    @BeforeEach
    void setUp() {
        casa = categories.save(new Category("Casa", "#6CCBFF"));
        Category trasporti = categories.save(new Category("Trasporti", "#FFE45C"));
        Category spesa = categories.save(new Category("Spesa", "#7EE08A"));
        expenses.save(new Expense(new BigDecimal("650.00"), LocalDate.of(2026, 10, 1), "Affitto", casa));
        expenses.save(new Expense(new BigDecimal("72.40"), LocalDate.of(2026, 10, 2), "Bolletta luce", casa));
        expenses.save(new Expense(new BigDecimal("39.00"), LocalDate.of(2026, 10, 1), "Abbonamento ATM", trasporti));
        expenses.save(new Expense(new BigDecimal("60.00"), LocalDate.of(2026, 10, 3), "Benzina", trasporti));
        expenses.save(new Expense(new BigDecimal("46.80"), LocalDate.of(2026, 10, 5), "Esselunga", spesa));
        expenses.save(new Expense(new BigDecimal("99.99"), LocalDate.of(2026, 9, 28), "Settembre", spesa));
    }

    @Test
    void summarizesTheMonthWithInheritedBudget() throws Exception {
        budgets.save(new MonthlyBudget("2026-09", new BigDecimal("1200.00")));

        mvc.perform(get("/api/summary").param("month", "2026-10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.month").value("2026-10"))
                .andExpect(jsonPath("$.total").value(868.2))
                .andExpect(jsonPath("$.budget").value(1200.0))
                .andExpect(jsonPath("$.budgetSourceMonth").value("2026-09"))
                .andExpect(jsonPath("$.remaining").value(331.8))
                .andExpect(jsonPath("$.byCategory.length()").value(3))
                .andExpect(jsonPath("$.byCategory[0].categoryId").value(casa.getId()))
                .andExpect(jsonPath("$.byCategory[0].name").value("Casa"))
                .andExpect(jsonPath("$.byCategory[0].color").value("#6CCBFF"))
                .andExpect(jsonPath("$.byCategory[0].total").value(722.4))
                .andExpect(jsonPath("$.byCategory[1].name").value("Trasporti"))
                .andExpect(jsonPath("$.byCategory[2].name").value("Spesa"));
    }

    @Test
    void remainingIsNegativeWhenOverBudget() throws Exception {
        budgets.save(new MonthlyBudget("2026-10", new BigDecimal("800.00")));

        mvc.perform(get("/api/summary").param("month", "2026-10"))
                .andExpect(jsonPath("$.remaining").value(-68.2));
    }

    @Test
    void budgetFieldsAreNullWithoutBudget() throws Exception {
        mvc.perform(get("/api/summary").param("month", "2026-10"))
                .andExpect(jsonPath("$.budget").value(nullValue()))
                .andExpect(jsonPath("$.budgetSourceMonth").value(nullValue()))
                .andExpect(jsonPath("$.remaining").value(nullValue()));
    }

    @Test
    void emptyMonthHasZeroTotalAndNoCategories() throws Exception {
        mvc.perform(get("/api/summary").param("month", "2026-12"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("\"total\":0.00")))
                .andExpect(jsonPath("$.byCategory.length()").value(0));
    }

    @Test
    void rejectsInvalidMonth() throws Exception {
        mvc.perform(get("/api/summary").param("month", "2026-00")).andExpect(status().isBadRequest());
    }
}
