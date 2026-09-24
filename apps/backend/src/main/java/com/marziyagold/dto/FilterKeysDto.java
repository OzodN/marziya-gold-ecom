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
public class FilterKeysDto {
    @Builder.Default
    private List<CategoryDto> categories = new ArrayList<>();
    @Builder.Default
    private List<StoneTypeDto> stoneTypes = new ArrayList<>();
    @Builder.Default
    private List<String> characteristicKeys = new ArrayList<>();
}
