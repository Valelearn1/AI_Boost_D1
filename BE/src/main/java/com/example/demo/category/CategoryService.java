package com.example.demo.category;

import com.example.demo.common.ConflictException;
import com.example.demo.common.NotFoundException;
import com.example.demo.expense.CategoryCount;
import com.example.demo.expense.ExpenseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class CategoryService {

    private final CategoryRepository categories;
    private final ExpenseRepository expenses;

    public CategoryService(CategoryRepository categories, ExpenseRepository expenses) {
        this.categories = categories;
        this.expenses = expenses;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> list() {
        Map<Long, Long> counts = expenses.countPerCategory().stream()
                .collect(Collectors.toMap(CategoryCount::categoryId, CategoryCount::count));
        return categories.findAllByOrderByNameAsc().stream()
                .map(category -> CategoryResponse.of(category, counts.getOrDefault(category.getId(), 0L)))
                .toList();
    }

    public CategoryResponse create(CategoryRequest request) {
        String name = request.name().strip();
        if (categories.existsByNameIgnoreCase(name)) {
            throw duplicate(name);
        }
        Category saved = categories.save(new Category(name, request.color().toUpperCase()));
        return CategoryResponse.of(saved, 0);
    }

    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = find(id);
        String name = request.name().strip();
        if (categories.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw duplicate(name);
        }
        category.setName(name);
        category.setColor(request.color().toUpperCase());
        return CategoryResponse.of(category, expenses.countByCategoryId(id));
    }

    public void delete(Long id) {
        Category category = find(id);
        long count = expenses.countByCategoryId(id);
        if (count > 0) {
            throw new ConflictException("La categoria «" + category.getName() + "» ha " + count
                    + (count == 1 ? " spesa" : " spese"));
        }
        categories.delete(category);
    }

    @Transactional(readOnly = true)
    public Category find(Long id) {
        return categories.findById(id)
                .orElseThrow(() -> new NotFoundException("Categoria " + id + " non trovata"));
    }

    private static ConflictException duplicate(String name) {
        return new ConflictException("Esiste già una categoria «" + name + "»");
    }
}
