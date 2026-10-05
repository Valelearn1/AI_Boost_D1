package com.example.demo.summary;

import com.example.demo.budget.BudgetResponse;
import com.example.demo.budget.BudgetService;
import com.example.demo.common.Money;
import com.example.demo.expense.CategoryTotal;
import com.example.demo.expense.ExpenseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class SummaryService {

    private final ExpenseRepository expenses;
    private final BudgetService budgets;

    public SummaryService(ExpenseRepository expenses, BudgetService budgets) {
        this.expenses = expenses;
        this.budgets = budgets;
    }

    public SummaryResponse forMonth(YearMonth month) {
        List<CategoryTotal> byCategory = expenses.totalsPerCategory(month.atDay(1), month.atEndOfMonth());
        BigDecimal total = byCategory.stream()
                .map(CategoryTotal::total)
                .reduce(Money.ZERO, BigDecimal::add);
        BudgetResponse budget = budgets.effective(month);
        BigDecimal remaining = budget.amount() == null ? null : budget.amount().subtract(total);
        return new SummaryResponse(month.toString(), total, budget.amount(), budget.sourceMonth(), remaining, byCategory);
    }
}
