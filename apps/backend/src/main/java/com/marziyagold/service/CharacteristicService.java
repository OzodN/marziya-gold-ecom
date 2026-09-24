package com.marziyagold.service;

import com.marziyagold.dto.CategoryDto;
import com.marziyagold.dto.FilterGroupDto;
import com.marziyagold.dto.FilterKeysDto;
import com.marziyagold.dto.StoneTypeDto;
import com.marziyagold.entity.Category;
import com.marziyagold.entity.CharacteristicKey;
import com.marziyagold.entity.Product;
import com.marziyagold.entity.StoneType;
import com.marziyagold.repository.CategoryRepository;
import com.marziyagold.repository.CharacteristicKeyRepository;
import com.marziyagold.repository.ProductRepository;
import com.marziyagold.repository.StoneTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CharacteristicService {

    private final CharacteristicKeyRepository characteristicKeyRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final StoneTypeRepository stoneTypeRepository;

    public List<FilterGroupDto> getFilterGroups() {
        List<CharacteristicKey> filterableKeys = characteristicKeyRepository.findByIsFilterableTrueOrderBySortOrderAsc();
        if (filterableKeys.isEmpty()) {
            return List.of();
        }

        Map<String, Set<String>> valuesByKey = new LinkedHashMap<>();
        for (CharacteristicKey key : filterableKeys) {
            valuesByKey.put(key.getName(), new LinkedHashSet<>());
        }

        // Scan visible products to discover actual distinct values
        List<Product> visibleProducts = productRepository.findByIsVisibleTrue(Pageable.unpaged()).getContent();
        for (Product product : visibleProducts) {
            List<Map<String, Object>> chars = product.getCharacteristics();
            if (chars != null) {
                for (Map<String, Object> entry : chars) {
                    Object nameObj = entry.get("name");
                    Object valObj = entry.get("value");
                    if (nameObj != null && valObj != null) {
                        String name = nameObj.toString().trim();
                        String val = valObj.toString().trim();
                        if (!val.isEmpty() && valuesByKey.containsKey(name)) {
                            valuesByKey.get(name).add(val);
                        }
                    }
                }
            }
        }

        List<FilterGroupDto> filterGroups = new ArrayList<>();
        for (CharacteristicKey key : filterableKeys) {
            Set<String> collectedValues = valuesByKey.getOrDefault(key.getName(), Set.of());
            List<String> sortedValues = collectedValues.stream().sorted().toList();
            filterGroups.add(FilterGroupDto.builder()
                    .name(key.getName())
                    .values(sortedValues)
                    .build());
        }

        return filterGroups;
    }

    public FilterKeysDto getFilterKeys() {
        List<CategoryDto> categories = categoryRepository.findAllByIsVisibleTrueOrderBySortOrderAsc().stream()
                .map(this::toCategoryDto)
                .toList();

        List<StoneTypeDto> stoneTypes = stoneTypeRepository.findByIsActiveTrue().stream()
                .map(this::toStoneTypeDto)
                .toList();

        List<String> keys = characteristicKeyRepository.findByIsFilterableTrueOrderBySortOrderAsc().stream()
                .map(CharacteristicKey::getName)
                .toList();

        return FilterKeysDto.builder()
                .categories(categories)
                .stoneTypes(stoneTypes)
                .characteristicKeys(keys)
                .build();
    }

    private CategoryDto toCategoryDto(Category category) {
        return CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .sortOrder(category.getSortOrder())
                .build();
    }

    private StoneTypeDto toStoneTypeDto(StoneType stoneType) {
        return StoneTypeDto.builder()
                .id(stoneType.getId())
                .name(stoneType.getName())
                .isActive(stoneType.getIsActive())
                .build();
    }
}
