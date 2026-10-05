package com.example.demo.category;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class CategoryRepositoryTest {

    @Autowired
    CategoryRepository categories;

    Category casa;

    @BeforeEach
    void setUp() {
        categories.save(new Category("Svago", "#FF8AC2"));
        casa = categories.save(new Category("Casa", "#6CCBFF"));
    }

    @Test
    void listsCategoriesByName() {
        assertThat(categories.findAllByOrderByNameAsc()).extracting(Category::getName)
                .containsExactly("Casa", "Svago");
    }

    @Test
    void findsNamesIgnoringCase() {
        assertThat(categories.existsByNameIgnoreCase("cASa")).isTrue();
        assertThat(categories.existsByNameIgnoreCase("Trasporti")).isFalse();
    }

    @Test
    void ignoresTheCategoryItselfWhenCheckingDuplicates() {
        assertThat(categories.existsByNameIgnoreCaseAndIdNot("CASA", casa.getId())).isFalse();
        assertThat(categories.existsByNameIgnoreCaseAndIdNot("svago", casa.getId())).isTrue();
    }
}
