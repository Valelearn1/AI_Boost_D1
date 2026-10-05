package com.example.demo.expense;

import java.math.BigDecimal;

public record CategoryTotal(Long categoryId, String name, String color, BigDecimal total) {
}
