package com.example.demo.summary;

import com.example.demo.expense.CategoryTotal;

import java.math.BigDecimal;
import java.util.List;

public record SummaryResponse(
        String month,
        BigDecimal total,
        BigDecimal budget,
        String budgetSourceMonth,
        BigDecimal remaining,
        List<CategoryTotal> byCategory) {
}
