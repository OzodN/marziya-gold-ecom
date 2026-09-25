package com.marziyagold.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductVisibilityUpdateRequest {

    @NotNull(message = "Поле isVisible обязательно")
    private Boolean isVisible;
}
