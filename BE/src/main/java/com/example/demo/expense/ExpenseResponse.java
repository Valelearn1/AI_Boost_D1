package com.example.demo.expense;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ExpenseResponse(Long id, BigDecimal amount, LocalDate date, String description, CategoryRef category) {

    public record CategoryRef(Long id, String name, String color) {
    }

    static ExpenseResponse of(Expense expense) {
        var category = expense.getCategory();
        return new ExpenseResponse(expense.getId(), expense.getAmount(), expense.getDate(), expense.getDescription(),
                new CategoryRef(category.getId(), category.getName(), category.getColor()));
    }
}
