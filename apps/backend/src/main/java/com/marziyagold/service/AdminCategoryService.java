package com.marziyagold.service;

import com.marziyagold.dto.CategoryAdminResponse;
import com.marziyagold.dto.CategoryAdminSaveRequest;
import com.marziyagold.entity.Category;
import com.marziyagold.exception.ResourceNotFoundException;
import com.marziyagold.repository.CategoryRepository;
import com.marziyagold.repository.ProductRepository;
import com.marziyagold.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminCategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public List<CategoryAdminResponse> getAllCategories() {
        return categoryRepository.findAllByOrderBySortOrderAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public CategoryAdminResponse createCategory(CategoryAdminSaveRequest request) {
        String name = request.getName() != null ? request.getName().trim() : "";
        if (categoryRepository.existsByName(name)) {
            throw new IllegalArgumentException("Категория с названием '" + name + "' уже существует");
        }

        String slug = request.getSlug() != null && !request.getSlug().isBlank()
                ? SlugUtils.toSlug(request.getSlug())
                : SlugUtils.toSlug(name);

        if (slug.isBlank()) {
            slug = "category-" + System.currentTimeMillis();
        }

        if (categoryRepository.existsBySlug(slug)) {
            throw new IllegalArgumentException("Категория со slug '" + slug + "' уже существует");
        }

        Category category = Category.builder()
                .name(name)
                .slug(slug)
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .isVisible(request.getIsVisible() != null ? request.getIsVisible() : true)
                .build();

        Category saved = categoryRepository.save(category);
        log.info("Admin created category id={}, name={}, slug={}", saved.getId(), saved.getName(), saved.getSlug());
        return toResponse(saved);
    }

    @Transactional
    public CategoryAdminResponse updateCategory(Long id, CategoryAdminSaveRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Категория с id " + id + " не найдена"));

        String name = request.getName() != null ? request.getName().trim() : "";
        if (categoryRepository.existsByNameAndIdNot(name, id)) {
            throw new IllegalArgumentException("Категория с названием '" + name + "' уже существует");
        }

        String slug;
        if (request.getSlug() != null && !request.getSlug().isBlank()) {
            slug = SlugUtils.toSlug(request.getSlug());
        } else if (!name.equals(category.getName())) {
            slug = SlugUtils.toSlug(name);
        } else {
            slug = category.getSlug();
        }

        if (slug.isBlank()) {
            slug = "category-" + id;
        }

        if (categoryRepository.existsBySlugAndIdNot(slug, id)) {
            throw new IllegalArgumentException("Категория со slug '" + slug + "' уже существует");
        }

        category.setName(name);
        category.setSlug(slug);
        if (request.getSortOrder() != null) {
            category.setSortOrder(request.getSortOrder());
        }
        if (request.getIsVisible() != null) {
            category.setIsVisible(request.getIsVisible());
        }

        Category updated = categoryRepository.save(category);
        log.info("Admin updated category id={}, name={}, slug={}", updated.getId(), updated.getName(), updated.getSlug());
        return toResponse(updated);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Категория с id " + id + " не найдена"));

        if (productRepository.existsByCategoryId(id)) {
            throw new IllegalStateException("Невозможно удалить категорию, к которой привязаны изделия");
        }

        categoryRepository.delete(category);
        log.info("Admin deleted category id={}", id);
    }

    private CategoryAdminResponse toResponse(Category category) {
        return CategoryAdminResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .sortOrder(category.getSortOrder())
                .isVisible(category.getIsVisible())
                .createdAt(category.getCreatedAt())
                .build();
    }
}
