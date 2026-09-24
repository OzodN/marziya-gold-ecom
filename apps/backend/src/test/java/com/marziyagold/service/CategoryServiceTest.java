package com.marziyagold.service;

import com.marziyagold.dto.CategoryDto;
import com.marziyagold.entity.Category;
import com.marziyagold.repository.CategoryRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryService categoryService;

    @Test
    @DisplayName("Should return visible categories ordered by sort order")
    void shouldReturnVisibleCategories() {
        Category c1 = Category.builder().id(1L).name("Кольца").slug("koltsa").sortOrder(1).isVisible(true).build();
        Category c2 = Category.builder().id(2L).name("Серьги").slug("sergi").sortOrder(2).isVisible(true).build();

        when(categoryRepository.findAllByIsVisibleTrueOrderBySortOrderAsc())
                .thenReturn(List.of(c1, c2));

        List<CategoryDto> result = categoryService.getVisibleCategories();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getName()).isEqualTo("Кольца");
        assertThat(result.get(0).getSlug()).isEqualTo("koltsa");
        assertThat(result.get(1).getName()).isEqualTo("Серьги");
    }
}
