package com.marziyagold.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductSummaryDto {
    private Long id;
    private String sku;
    private String name;
    private String slug;
    private String categoryName;
    private String categorySlug;
    private String mainImageUrl;
    private Boolean isVisible;
    @Builder.Default
    private List<CharacteristicEntryDto> characteristics = new ArrayList<>();
}
