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
public class StoneTypeSaveRequest {

    @NotBlank(message = "Название типа камня обязательно")
    @Size(max = 100, message = "Название типа камня не может превышать 100 символов")
    private String name;

    @Builder.Default
    private Boolean isActive = true;
}
