package com.example.demo.budget;

import com.example.demo.common.Money;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.YearMonth;

@Service
@Transactional
public class BudgetService {

    private final MonthlyBudgetRepository budgets;

    public BudgetService(MonthlyBudgetRepository budgets) {
        this.budgets = budgets;
    }

    @Transactional(readOnly = true)
    public BudgetResponse effective(YearMonth month) {
        String key = month.toString();
        return budgets.findByMonth(key)
                .or(() -> budgets.findFirstByMonthLessThanOrderByMonthDesc(key))
                .map(budget -> new BudgetResponse(key, budget.getAmount(), budget.getMonth()))
                .orElse(new BudgetResponse(key, null, null));
    }

    public BudgetResponse set(YearMonth month, BigDecimal requested) {
        String key = month.toString();
        BigDecimal amount = Money.cents(requested);
        MonthlyBudget budget = budgets.findByMonth(key)
                .orElseGet(() -> new MonthlyBudget(key, amount));
        budget.setAmount(amount);
        budgets.save(budget);
        return new BudgetResponse(key, amount, key);
    }

    public void remove(YearMonth month) {
        budgets.findByMonth(month.toString()).ifPresent(budgets::delete);
    }
}
