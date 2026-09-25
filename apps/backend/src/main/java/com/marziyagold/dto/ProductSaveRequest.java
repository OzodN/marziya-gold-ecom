package com.marziyagold.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class ProductSaveRequest {

    @NotBlank(message = "Артикул (SKU) обязателен")
    private String sku;

    @NotBlank(message = "Название изделия обязательно")
    private String name;

    private String description;

    @NotNull(message = "Категория обязательна")
    private Long categoryId;

    @Builder.Default
    private Boolean isVisible = true;

    @Builder.Default
    private List<String> imageUrls = new ArrayList<>();

    @Builder.Default
    private List<CharacteristicEntryDto> characteristics = new ArrayList<>();

    @Builder.Default
    private List<@Valid AdminProductStoneRequest> stones = new ArrayList<>();
}
