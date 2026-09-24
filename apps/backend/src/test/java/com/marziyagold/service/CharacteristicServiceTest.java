package com.marziyagold.service;

import com.marziyagold.dto.FilterGroupDto;
import com.marziyagold.dto.FilterKeysDto;
import com.marziyagold.entity.Category;
import com.marziyagold.entity.CharacteristicKey;
import com.marziyagold.entity.Product;
import com.marziyagold.entity.StoneType;
import com.marziyagold.repository.CategoryRepository;
import com.marziyagold.repository.CharacteristicKeyRepository;
import com.marziyagold.repository.ProductRepository;
import com.marziyagold.repository.StoneTypeRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CharacteristicServiceTest {

    @Mock
    private CharacteristicKeyRepository characteristicKeyRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private StoneTypeRepository stoneTypeRepository;

    @InjectMocks
    private CharacteristicService characteristicService;

    @Test
    @DisplayName("Should return filter groups with distinct values found in visible products")
    void shouldReturnFilterGroups() {
        CharacteristicKey k1 = CharacteristicKey.builder().id(1L).name("Металл").sortOrder(1).isFilterable(true).build();
        CharacteristicKey k2 = CharacteristicKey.builder().id(2L).name("Проба").sortOrder(2).isFilterable(true).build();

        when(characteristicKeyRepository.findByIsFilterableTrueOrderBySortOrderAsc())
                .thenReturn(List.of(k1, k2));

        Product p1 = Product.builder()
                .id(1L)
                .isVisible(true)
                .characteristics(List.of(
                        Map.of("name", "Металл", "value", "Желтое золото"),
                        Map.of("name", "Проба", "value", "585")
                ))
                .build();

        Product p2 = Product.builder()
                .id(2L)
                .isVisible(true)
                .characteristics(List.of(
                        Map.of("name", "Металл", "value", "Белое золото"),
                        Map.of("name", "Проба", "value", "585")
                ))
                .build();

        when(productRepository.findByIsVisibleTrue(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(p1, p2)));

        List<FilterGroupDto> filterGroups = characteristicService.getFilterGroups();

        assertThat(filterGroups).hasSize(2);
        assertThat(filterGroups.get(0).getName()).isEqualTo("Металл");
        assertThat(filterGroups.get(0).getValues()).containsExactly("Белое золото", "Желтое золото");
        assertThat(filterGroups.get(1).getName()).isEqualTo("Проба");
        assertThat(filterGroups.get(1).getValues()).containsExactly("585");
    }

    @Test
    @DisplayName("Should return filter keys with categories, stoneTypes, and characteristic keys")
    void shouldReturnFilterKeys() {
        when(categoryRepository.findAllByIsVisibleTrueOrderBySortOrderAsc())
                .thenReturn(List.of(Category.builder().id(1L).name("Кольца").slug("koltsa").sortOrder(1).build()));
        when(stoneTypeRepository.findByIsActiveTrue())
                .thenReturn(List.of(StoneType.builder().id(1L).name("Бриллиант").isActive(true).build()));
        when(characteristicKeyRepository.findByIsFilterableTrueOrderBySortOrderAsc())
                .thenReturn(List.of(CharacteristicKey.builder().name("Металл").build()));

        FilterKeysDto filterKeys = characteristicService.getFilterKeys();

        assertThat(filterKeys).isNotNull();
        assertThat(filterKeys.getCategories()).hasSize(1);
        assertThat(filterKeys.getStoneTypes()).hasSize(1);
        assertThat(filterKeys.getCharacteristicKeys()).containsExactly("Металл");
    }
}
