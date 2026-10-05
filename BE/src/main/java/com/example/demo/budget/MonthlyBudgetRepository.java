package com.example.demo.budget;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MonthlyBudgetRepository extends JpaRepository<MonthlyBudget, Long> {

    Optional<MonthlyBudget> findByMonth(String month);

    /** I mesi "YYYY-MM" si ordinano correttamente anche come stringhe. */
    Optional<MonthlyBudget> findFirstByMonthLessThanOrderByMonthDesc(String month);
}
