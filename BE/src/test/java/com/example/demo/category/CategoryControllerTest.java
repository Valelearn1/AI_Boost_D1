package com.example.demo.category;

import com.example.demo.expense.Expense;
import com.example.demo.expense.ExpenseRepository;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CategoryControllerTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    CategoryRepository categories;

    @Autowired
    ExpenseRepository expenses;

    Category casa;
    Category svago;

    @BeforeEach
    void setUp() {
        casa = categories.save(new Category("Casa", "#6CCBFF"));
        svago = categories.save(new Category("Svago", "#FF8AC2"));
        expenses.save(new Expense(new BigDecimal("650.00"), LocalDate.of(2026, 10, 1), "Affitto", casa));
    }

    @Test
    void listsCategoriesByNameWithExpenseCount() throws Exception {
        mvc.perform(get("/api/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Casa"))
                .andExpect(jsonPath("$[0].color").value("#6CCBFF"))
                .andExpect(jsonPath("$[0].expenseCount").value(1))
                .andExpect(jsonPath("$[1].name").value("Svago"))
                .andExpect(jsonPath("$[1].expenseCount").value(0));
    }

    @Test
    void createsCategoryTrimmingNameAndUppercasingColor() throws Exception {
        mvc.perform(post("/api/categories").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name": "  Regali ", "color": "#c7a6ff"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.name").value("Regali"))
                .andExpect(jsonPath("$.color").value("#C7A6FF"))
                .andExpect(jsonPath("$.expenseCount").value(0));
    }

    @Test
    void rejectsDuplicateNameIgnoringCaseAndSpaces() throws Exception {
        mvc.perform(post("/api/categories").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name": " casa ", "color": "#6CCBFF"}
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("Esiste già una categoria «casa»"));
    }

    @Test
    void rejectsInvalidCategory() throws Exception {
        mvc.perform(post("/api/categories").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name": "", "color": "blu"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.name").value("Il nome è obbligatorio"))
                .andExpect(jsonPath("$.errors.color").value("Il colore deve essere nel formato #RRGGBB"));
    }

    @Test
    void rejectsNameLongerThan30Characters() throws Exception {
        mvc.perform(post("/api/categories").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name": "Una categoria con un nome troppo lungo", "color": "#6CCBFF"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.name").value("Il nome può avere al massimo 30 caratteri"));
    }

    @Test
    void acceptsNameOf30CharactersPlusOuterSpaces() throws Exception {
        mvc.perform(post("/api/categories").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name": " %s ", "color": "#6CCBFF"}
                                """.formatted("x".repeat(30))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("x".repeat(30)));
    }

    @Test
    void updatesCategory() throws Exception {
        mvc.perform(put("/api/categories/{id}", casa.getId()).contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name": "Casa e bollette", "color": "#5FE0D2"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Casa e bollette"))
                .andExpect(jsonPath("$.color").value("#5FE0D2"))
                .andExpect(jsonPath("$.expenseCount").value(1));
    }

    @Test
    void allowsChangingOnlyTheCaseOfItsOwnName() throws Exception {
        mvc.perform(put("/api/categories/{id}", casa.getId()).contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name": "CASA", "color": "#6CCBFF"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("CASA"));
    }

    @Test
    void rejectsRenamingToAnotherCategoryName() throws Exception {
        mvc.perform(put("/api/categories/{id}", casa.getId()).contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name": "svago", "color": "#6CCBFF"}
                                """))
                .andExpect(status().isConflict());
    }

    @Test
    void updatingMissingCategoryIs404() throws Exception {
        mvc.perform(put("/api/categories/{id}", 9999).contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name": "Nuova", "color": "#6CCBFF"}
                                """))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Categoria 9999 non trovata"));
    }

    @Test
    void deletesUnusedCategory() throws Exception {
        mvc.perform(delete("/api/categories/{id}", svago.getId()))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/categories"))
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void refusesToDeleteCategoryInUse() throws Exception {
        mvc.perform(delete("/api/categories/{id}", casa.getId()))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("La categoria «Casa» ha 1 spesa"));
    }

    @Test
    void deleteMessageUsesPluralForManyExpenses() throws Exception {
        expenses.save(new Expense(new BigDecimal("72.40"), LocalDate.of(2026, 10, 2), "Bolletta luce", casa));

        mvc.perform(delete("/api/categories/{id}", casa.getId()))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("La categoria «Casa» ha 2 spese"));
    }

    @Test
    void deletingMissingCategoryIs404() throws Exception {
        mvc.perform(delete("/api/categories/{id}", 9999))
                .andExpect(status().isNotFound());
    }
}
