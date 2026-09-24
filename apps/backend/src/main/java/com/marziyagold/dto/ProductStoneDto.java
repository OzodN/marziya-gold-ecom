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
public class ProductStoneDto {
    private Long id;
    private Long stoneTypeId;
    private String stoneTypeName;
    private Integer sortOrder;
    @Builder.Default
    private List<CharacteristicEntryDto> characteristics = new ArrayList<>();
}
