package com.marziyagold.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CharacteristicKeySaveRequest {

    @NotBlank(message = "Название характеристики обязательно")
    @Size(max = 100, message = "Название характеристики не может превышать 100 символов")
    private String name;

    @Builder.Default
    private Integer sortOrder = 0;

    @Builder.Default
    private Boolean isFilterable = true;
}
