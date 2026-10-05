package com.example.demo.expense;

import com.example.demo.category.Category;
import com.example.demo.category.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ExpenseControllerTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    CategoryRepository categories;

    @Autowired
    ExpenseRepository expenses;

    Category casa;
    Category ristoranti;
    Expense pizzeria;

    @BeforeEach
    void setUp() {
        casa = categories.save(new Category("Casa", "#6CCBFF"));
        ristoranti = categories.save(new Category("Ristoranti", "#FFB050"));
        expenses.save(new Expense(new BigDecimal("72.40"), LocalDate.of(2026, 9, 30), "Bolletta", casa));
        expenses.save(new Expense(new BigDecimal("650.00"), LocalDate.of(2026, 10, 1), "Affitto", casa));
        pizzeria = expenses.save(new Expense(new BigDecimal("38.00"), LocalDate.of(2026, 10, 4), "Pizzeria Da Gino", ristoranti));
        expenses.save(new Expense(new BigDecimal("12.00"), LocalDate.of(2026, 11, 1), "Novembre", ristoranti));
    }

    @Test
    void listsExpensesOfTheMonthNewestFirstWithCategory() throws Exception {
        mvc.perform(get("/api/expenses").param("month", "2026-10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].description").value("Pizzeria Da Gino"))
                .andExpect(jsonPath("$[0].amount").value(38.0))
                .andExpect(jsonPath("$[0].date").value("2026-10-04"))
                .andExpect(jsonPath("$[0].category.name").value("Ristoranti"))
                .andExpect(jsonPath("$[0].category.color").value("#FFB050"))
                .andExpect(jsonPath("$[1].description").value("Affitto"));
    }

    @Test
    void listForAnEmptyMonthIsEmpty() throws Exception {
        mvc.perform(get("/api/expenses").param("month", "2026-12"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void listRejectsInvalidOrMissingMonth() throws Exception {
        mvc.perform(get("/api/expenses").param("month", "2026-13")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/expenses").param("month", "10-2026")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/expenses")).andExpect(status().isBadRequest());
    }

    @Test
    void createsExpenseTrimmingDescription() throws Exception {
        mvc.perform(post("/api/expenses").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"amount": 3.20, "date": "2026-10-05", "description": "  Caffè e brioche ", "categoryId": %d}
                                """.formatted(ristoranti.getId())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.amount").value(3.2))
                .andExpect(jsonPath("$.description").value("Caffè e brioche"))
                .andExpect(jsonPath("$.category.id").value(ristoranti.getId()));
    }

    @Test
    void blankDescriptionIsStoredAsNull() throws Exception {
        mvc.perform(post("/api/expenses").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"amount": 5, "date": "2026-10-05", "description": "   ", "categoryId": %d}
                                """.formatted(casa.getId())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.description").value(nullValue()));
    }

    @Test
    void rejectsZeroNegativeAndTooPreciseAmounts() throws Exception {
        for (String amount : new String[] {"0", "-5", "12.345"}) {
            mvc.perform(post("/api/expenses").contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"amount": %s, "date": "2026-10-05", "categoryId": %d}
                                    """.formatted(amount, casa.getId())))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errors.amount").exists());
        }
    }

    @Test
    void rejectsTooLargeAmountWithItsOwnMessage() throws Exception {
        mvc.perform(post("/api/expenses").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"amount": 100000000, "date": "2026-10-05", "categoryId": %d}
                                """.formatted(casa.getId())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.amount").value("L'importo è troppo grande"));
    }

    @Test
    void rejectsDecimalCategoryId() throws Exception {
        mvc.perform(post("/api/expenses").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"amount": 5, "date": "2026-10-05", "categoryId": %d.7}
                                """.formatted(casa.getId())))
                .andExpect(status().isBadRequest());
    }

    @Test
    void acceptsDescriptionOf100CharactersPlusOuterSpaces() throws Exception {
        mvc.perform(post("/api/expenses").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"amount": 5, "date": "2026-10-05", "description": " %s ", "categoryId": %d}
                                """.formatted("x".repeat(100), casa.getId())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.description").value("x".repeat(100)));
    }

    @Test
    void alwaysAnswersAmountsWithTwoDecimals() throws Exception {
        mvc.perform(post("/api/expenses").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"amount": 5, "date": "2026-10-05", "categoryId": %d}
                                """.formatted(casa.getId())))
                .andExpect(status().isCreated())
                .andExpect(content().string(containsString("\"amount\":5.00")));
    }

    @Test
    void rejectsMissingFields() throws Exception {
        mvc.perform(post("/api/expenses").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.amount").value("L'importo è obbligatorio"))
                .andExpect(jsonPath("$.errors.date").value("La data è obbligatoria"))
                .andExpect(jsonPath("$.errors.categoryId").value("La categoria è obbligatoria"));
    }

    @Test
    void rejectsDescriptionLongerThan100Characters() throws Exception {
        mvc.perform(post("/api/expenses").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"amount": 5, "date": "2026-10-05", "description": "%s", "categoryId": %d}
                                """.formatted("x".repeat(101), casa.getId())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.description").value("La descrizione può avere al massimo 100 caratteri"));
    }

    @Test
    void rejectsImpossibleDate() throws Exception {
        mvc.perform(post("/api/expenses").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"amount": 5, "date": "2026-02-30", "categoryId": %d}
                                """.formatted(casa.getId())))
                .andExpect(status().isBadRequest());
    }

    @Test
    void unknownCategoryIs404() throws Exception {
        mvc.perform(post("/api/expenses").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"amount": 5, "date": "2026-10-05", "categoryId": 9999}
                                """))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Categoria 9999 non trovata"));
    }

    @Test
    void getsOneExpense() throws Exception {
        mvc.perform(get("/api/expenses/{id}", pizzeria.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Pizzeria Da Gino"));
    }

    @Test
    void missingExpenseIs404() throws Exception {
        mvc.perform(get("/api/expenses/{id}", 9999))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Spesa 9999 non trovata"));
    }

    @Test
    void updatesExpenseIncludingCategory() throws Exception {
        mvc.perform(put("/api/expenses/{id}", pizzeria.getId()).contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"amount": 40.50, "date": "2026-10-03", "description": "Cena", "categoryId": %d}
                                """.formatted(casa.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amount").value(40.5))
                .andExpect(jsonPath("$.date").value("2026-10-03"))
                .andExpect(jsonPath("$.description").value("Cena"))
                .andExpect(jsonPath("$.category.name").value("Casa"));
    }

    @Test
    void updatingMissingExpenseIs404() throws Exception {
        mvc.perform(put("/api/expenses/{id}", 9999).contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"amount": 1, "date": "2026-10-03", "categoryId": %d}
                                """.formatted(casa.getId())))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Spesa 9999 non trovata"));
    }

    @Test
    void deletesExpense() throws Exception {
        mvc.perform(delete("/api/expenses/{id}", pizzeria.getId()))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/expenses/{id}", pizzeria.getId()))
                .andExpect(status().isNotFound());
    }
}
