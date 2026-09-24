package com.marziyagold.service;

import com.marziyagold.dto.CategoryDto;
import com.marziyagold.entity.Category;
import com.marziyagold.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryDto> getVisibleCategories() {
        return categoryRepository.findAllByIsVisibleTrueOrderBySortOrderAsc().stream()
                .map(this::toDto)
                .toList();
    }

    private CategoryDto toDto(Category category) {
        return CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .sortOrder(category.getSortOrder())
                .build();
    }
}
