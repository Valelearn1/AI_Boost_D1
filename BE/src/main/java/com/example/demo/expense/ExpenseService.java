package com.example.demo.expense;

import com.example.demo.category.Category;
import com.example.demo.category.CategoryService;
import com.example.demo.common.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.YearMonth;
import java.util.List;

@Service
@Transactional
public class ExpenseService {

    private final ExpenseRepository expenses;
    private final CategoryService categoryService;

    public ExpenseService(ExpenseRepository expenses, CategoryService categoryService) {
        this.expenses = expenses;
        this.categoryService = categoryService;
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> listByMonth(YearMonth month) {
        return expenses.findByDateBetweenOrderByDateDescIdDesc(month.atDay(1), month.atEndOfMonth()).stream()
                .map(ExpenseResponse::of)
                .toList();
    }

    @Transactional(readOnly = true)
    public ExpenseResponse get(Long id) {
        return ExpenseResponse.of(find(id));
    }

    public ExpenseResponse create(ExpenseRequest request) {
        Category category = categoryService.find(request.categoryId());
        Expense saved = expenses.save(
                new Expense(request.amount(), request.date(), normalize(request.description()), category));
        return ExpenseResponse.of(saved);
    }

    public ExpenseResponse update(Long id, ExpenseRequest request) {
        Expense expense = find(id);
        expense.setAmount(request.amount());
        expense.setDate(request.date());
        expense.setDescription(normalize(request.description()));
        expense.setCategory(categoryService.find(request.categoryId()));
        return ExpenseResponse.of(expense);
    }

    public void delete(Long id) {
        expenses.delete(find(id));
    }

    private Expense find(Long id) {
        return expenses.findById(id)
                .orElseThrow(() -> new NotFoundException("Spesa " + id + " non trovata"));
    }

    private static String normalize(String description) {
        if (description == null) {
            return null;
        }
        String stripped = description.strip();
        return stripped.isEmpty() ? null : stripped;
    }
}
