package com.example.demo.budget;

import com.example.demo.common.Months;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService service;

    public BudgetController(BudgetService service) {
        this.service = service;
    }

    @GetMapping("/{month}")
    public BudgetResponse get(@PathVariable String month) {
        return service.effective(Months.parse(month));
    }

    @PutMapping("/{month}")
    public BudgetResponse set(@PathVariable String month, @Valid @RequestBody BudgetRequest request) {
        return service.set(Months.parse(month), request.amount());
    }

    @DeleteMapping("/{month}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String month) {
        service.remove(Months.parse(month));
    }
}
