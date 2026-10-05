package com.example.demo.category;

public record CategoryResponse(Long id, String name, String color, long expenseCount) {

    static CategoryResponse of(Category category, long expenseCount) {
        return new CategoryResponse(category.getId(), category.getName(), category.getColor(), expenseCount);
    }
}
