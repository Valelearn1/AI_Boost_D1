package com.example.demo.config;

import com.example.demo.category.Category;
import com.example.demo.category.CategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
public class CategorySeeder implements CommandLineRunner {

    private final CategoryRepository categories;

    public CategorySeeder(CategoryRepository categories) {
        this.categories = categories;
    }

    @Override
    public void run(String... args) {
        if (categories.count() > 0) {
            return;
        }
        categories.saveAll(List.of(
                new Category("Spesa", "#7EE08A"),
                new Category("Casa", "#6CCBFF"),
                new Category("Trasporti", "#FFE45C"),
                new Category("Ristoranti", "#FFB050"),
                new Category("Svago", "#FF8AC2"),
                new Category("Salute", "#5FE0D2"),
                new Category("Altro", "#D4D8E0")));
    }
}
