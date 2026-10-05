package com.example.demo.expense;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    @EntityGraph(attributePaths = "category")
    List<Expense> findByDateBetweenOrderByDateDescIdDesc(LocalDate from, LocalDate to);

    long countByCategoryId(Long categoryId);

    @Query("select new com.example.demo.expense.CategoryCount(e.category.id, count(e)) "
            + "from Expense e group by e.category.id")
    List<CategoryCount> countPerCategory();

    @Query("select new com.example.demo.expense.CategoryTotal(c.id, c.name, c.color, sum(e.amount)) "
            + "from Expense e join e.category c "
            + "where e.date between :from and :to "
            + "group by c.id, c.name, c.color "
            + "order by sum(e.amount) desc")
    List<CategoryTotal> totalsPerCategory(@Param("from") LocalDate from, @Param("to") LocalDate to);
}
