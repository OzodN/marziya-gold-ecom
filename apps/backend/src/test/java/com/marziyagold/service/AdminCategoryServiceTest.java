package com.marziyagold.service;

import com.marziyagold.dto.CategoryAdminResponse;
import com.marziyagold.dto.CategoryAdminSaveRequest;
import com.marziyagold.entity.Category;
import com.marziyagold.exception.ResourceNotFoundException;
import com.marziyagold.repository.CategoryRepository;
import com.marziyagold.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminCategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private AdminCategoryService adminCategoryService;

    private Category cat1;
    private Category cat2;

    @BeforeEach
    void setUp() {
        cat1 = Category.builder()
                .id(1L)
                .name("Кольца")
                .slug("koltsa")
                .sortOrder(1)
                .isVisible(true)
                .createdAt(LocalDateTime.now())
                .build();

        cat2 = Category.builder()
                .id(2L)
                .name("Серьги")
                .slug("sergi")
                .sortOrder(2)
                .isVisible(false)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("getAllCategories should return all categories ordered by sortOrder including invisible ones")
    void shouldReturnAllCategories() {
        when(categoryRepository.findAllByOrderBySortOrderAsc()).thenReturn(List.of(cat1, cat2));

        List<CategoryAdminResponse> result = adminCategoryService.getAllCategories();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getName()).isEqualTo("Кольца");
        assertThat(result.get(0).getIsVisible()).isTrue();
        assertThat(result.get(1).getName()).isEqualTo("Серьги");
        assertThat(result.get(1).getIsVisible()).isFalse();
    }

    @Test
    @DisplayName("createCategory should create category with custom slug")
    void shouldCreateCategoryWithCustomSlug() {
        CategoryAdminSaveRequest request = CategoryAdminSaveRequest.builder()
                .name("Браслеты")
                .slug("custom-braslety")
                .sortOrder(3)
                .isVisible(true)
                .build();

        when(categoryRepository.existsByName("Браслеты")).thenReturn(false);
        when(categoryRepository.existsBySlug("custom-braslety")).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> {
            Category c = invocation.getArgument(0);
            c.setId(3L);
            c.setCreatedAt(LocalDateTime.now());
            return c;
        });

        CategoryAdminResponse created = adminCategoryService.createCategory(request);

        assertThat(created.getId()).isEqualTo(3L);
        assertThat(created.getName()).isEqualTo("Браслеты");
        assertThat(created.getSlug()).isEqualTo("custom-braslety");
        assertThat(created.getSortOrder()).isEqualTo(3);
        assertThat(created.getIsVisible()).isTrue();
    }

    @Test
    @DisplayName("createCategory should auto-generate slug from name when slug is null or blank")
    void shouldAutoGenerateSlugFromName() {
        CategoryAdminSaveRequest request = CategoryAdminSaveRequest.builder()
                .name("Колье и подвески")
                .slug(null)
                .sortOrder(4)
                .isVisible(true)
                .build();

        when(categoryRepository.existsByName("Колье и подвески")).thenReturn(false);
        when(categoryRepository.existsBySlug("kole-i-podveski")).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> {
            Category c = invocation.getArgument(0);
            c.setId(4L);
            return c;
        });

        CategoryAdminResponse created = adminCategoryService.createCategory(request);

        assertThat(created.getSlug()).isEqualTo("kole-i-podveski");
    }

    @Test
    @DisplayName("createCategory should throw IllegalArgumentException if name already exists")
    void shouldThrowWhenCreatingCategoryWithDuplicateName() {
        CategoryAdminSaveRequest request = CategoryAdminSaveRequest.builder()
                .name("Кольца")
                .build();

        when(categoryRepository.existsByName("Кольца")).thenReturn(true);

        assertThatThrownBy(() -> adminCategoryService.createCategory(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Кольца");

        verify(categoryRepository, never()).save(any());
    }

    @Test
    @DisplayName("createCategory should throw IllegalArgumentException if slug already exists")
    void shouldThrowWhenCreatingCategoryWithDuplicateSlug() {
        CategoryAdminSaveRequest request = CategoryAdminSaveRequest.builder()
                .name("Новые Кольца")
                .slug("koltsa")
                .build();

        when(categoryRepository.existsByName("Новые Кольца")).thenReturn(false);
        when(categoryRepository.existsBySlug("koltsa")).thenReturn(true);

        assertThatThrownBy(() -> adminCategoryService.createCategory(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("koltsa");

        verify(categoryRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateCategory should update existing category")
    void shouldUpdateCategory() {
        CategoryAdminSaveRequest request = CategoryAdminSaveRequest.builder()
                .name("Кольца эксклюзив")
                .slug("koltsa-exclusive")
                .sortOrder(10)
                .isVisible(false)
                .build();

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(cat1));
        when(categoryRepository.existsByNameAndIdNot("Кольца эксклюзив", 1L)).thenReturn(false);
        when(categoryRepository.existsBySlugAndIdNot("koltsa-exclusive", 1L)).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CategoryAdminResponse updated = adminCategoryService.updateCategory(1L, request);

        assertThat(updated.getName()).isEqualTo("Кольца эксклюзив");
        assertThat(updated.getSlug()).isEqualTo("koltsa-exclusive");
        assertThat(updated.getSortOrder()).isEqualTo(10);
        assertThat(updated.getIsVisible()).isFalse();
    }

    @Test
    @DisplayName("updateCategory should throw ResourceNotFoundException when category not found")
    void shouldThrowWhenUpdatingNonExistentCategory() {
        CategoryAdminSaveRequest request = CategoryAdminSaveRequest.builder().name("Test").build();
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminCategoryService.updateCategory(99L, request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("updateCategory should throw IllegalArgumentException when duplicate name exists")
    void shouldThrowWhenUpdatingCategoryWithDuplicateName() {
        CategoryAdminSaveRequest request = CategoryAdminSaveRequest.builder().name("Серьги").build();
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(cat1));
        when(categoryRepository.existsByNameAndIdNot("Серьги", 1L)).thenReturn(true);

        assertThatThrownBy(() -> adminCategoryService.updateCategory(1L, request))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("updateCategory should throw IllegalArgumentException when duplicate slug exists")
    void shouldThrowWhenUpdatingCategoryWithDuplicateSlug() {
        CategoryAdminSaveRequest request = CategoryAdminSaveRequest.builder()
                .name("Кольца")
                .slug("sergi")
                .build();
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(cat1));
        when(categoryRepository.existsByNameAndIdNot("Кольца", 1L)).thenReturn(false);
        when(categoryRepository.existsBySlugAndIdNot("sergi", 1L)).thenReturn(true);

        assertThatThrownBy(() -> adminCategoryService.updateCategory(1L, request))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("deleteCategory should delete category when no products attached")
    void shouldDeleteCategorySuccessfully() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(cat1));
        when(productRepository.existsByCategoryId(1L)).thenReturn(false);

        adminCategoryService.deleteCategory(1L);

        verify(categoryRepository).delete(cat1);
    }

    @Test
    @DisplayName("deleteCategory should throw ResourceNotFoundException when not found")
    void shouldThrowWhenDeletingNonExistentCategory() {
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminCategoryService.deleteCategory(99L))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(categoryRepository, never()).delete(any());
    }

    @Test
    @DisplayName("deleteCategory should throw IllegalStateException when products are linked to category")
    void shouldThrowWhenDeletingCategoryWithProducts() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(cat1));
        when(productRepository.existsByCategoryId(1L)).thenReturn(true);

        assertThatThrownBy(() -> adminCategoryService.deleteCategory(1L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("привязаны изделия");

        verify(categoryRepository, never()).delete(any());
    }
}
