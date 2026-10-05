package com.example.demo.config;

import com.example.demo.category.Category;
import com.example.demo.category.CategoryRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;

@DataJpaTest
class CategorySeederTest {

    @Autowired
    CategoryRepository categories;

    @Test
    void createsTheDefaultCategoriesWhenEmpty() {
        new CategorySeeder(categories).run();

        assertThat(categories.findAllByOrderByNameAsc())
                .extracting(Category::getName, Category::getColor)
                .containsExactly(
                        tuple("Altro", "#D4D8E0"),
                        tuple("Casa", "#6CCBFF"),
                        tuple("Ristoranti", "#FFB050"),
                        tuple("Salute", "#5FE0D2"),
                        tuple("Spesa", "#7EE08A"),
                        tuple("Svago", "#FF8AC2"),
                        tuple("Trasporti", "#FFE45C"));
    }

    @Test
    void doesNothingWhenCategoriesExist() {
        categories.save(new Category("Regali", "#C7A6FF"));

        new CategorySeeder(categories).run();

        assertThat(categories.count()).isEqualTo(1);
    }
}
