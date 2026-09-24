package com.marziyagold.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDetailDto {
    private Long id;
    private String sku;
    private String name;
    private String slug;
    private String description;
    private CategoryDto category;
    private String categoryName;
    private String categorySlug;
    @Builder.Default
    private List<ProductImageDto> images = new ArrayList<>();
    @Builder.Default
    private List<ProductStoneDto> stones = new ArrayList<>();
    @Builder.Default
    private List<CharacteristicEntryDto> characteristics = new ArrayList<>();
    private LocalDateTime createdAt;
    private Boolean isVisible;
}
