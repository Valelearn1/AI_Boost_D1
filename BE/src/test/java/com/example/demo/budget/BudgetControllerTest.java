package com.example.demo.budget;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class BudgetControllerTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    MonthlyBudgetRepository budgets;

    @Test
    void returnsInheritedBudget() throws Exception {
        budgets.save(new MonthlyBudget("2026-09", new BigDecimal("1200.00")));

        mvc.perform(get("/api/budgets/2026-10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.month").value("2026-10"))
                .andExpect(jsonPath("$.amount").value(1200.0))
                .andExpect(jsonPath("$.sourceMonth").value("2026-09"));
    }

    @Test
    void returnsNullsWhenThereIsNoBudget() throws Exception {
        mvc.perform(get("/api/budgets/2026-10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amount").value(nullValue()))
                .andExpect(jsonPath("$.sourceMonth").value(nullValue()));
    }

    @Test
    void setsTheBudgetOfTheMonth() throws Exception {
        mvc.perform(put("/api/budgets/2026-10").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"amount": 1300.00}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amount").value(1300.0))
                .andExpect(jsonPath("$.sourceMonth").value("2026-10"));
    }

    @Test
    void rejectsInvalidAmount() throws Exception {
        mvc.perform(put("/api/budgets/2026-10").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"amount": 0}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.amount").value("Il budget deve essere maggiore di zero"));
    }

    @Test
    void rejectsTooLargeBudgetWithItsOwnMessage() throws Exception {
        mvc.perform(put("/api/budgets/2026-10").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"amount": 100000000}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.amount").value("Il budget è troppo grande"));
    }

    @Test
    void answersBudgetWithTwoDecimals() throws Exception {
        mvc.perform(put("/api/budgets/2026-10").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"amount": 1300}
                                """))
                .andExpect(content().string(containsString("\"amount\":1300.00")));
    }

    @Test
    void rejectsInvalidMonth() throws Exception {
        mvc.perform(get("/api/budgets/ottobre")).andExpect(status().isBadRequest());
    }

    @Test
    void rejectsExtendedYearInsteadOfFailing() throws Exception {
        mvc.perform(put("/api/budgets/+10000-01").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"amount": 100}
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deletesTheBudgetOfTheMonth() throws Exception {
        budgets.save(new MonthlyBudget("2026-10", new BigDecimal("1300.00")));

        mvc.perform(delete("/api/budgets/2026-10")).andExpect(status().isNoContent());
        mvc.perform(get("/api/budgets/2026-10"))
                .andExpect(jsonPath("$.amount").value(nullValue()));
    }
}
