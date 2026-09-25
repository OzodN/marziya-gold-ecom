package com.marziyagold.dto;

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
public class AdminProductStoneRequest {

    @NotNull(message = "Тип камня обязателен")
    private Long stoneTypeId;

    @Builder.Default
    private Integer sortOrder = 0;

    @Builder.Default
    private List<CharacteristicEntryDto> characteristics = new ArrayList<>();
}
