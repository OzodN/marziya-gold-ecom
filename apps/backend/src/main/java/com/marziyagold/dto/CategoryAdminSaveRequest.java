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
public class CategoryAdminSaveRequest {

    @NotBlank(message = "Название категории обязательно")
    @Size(max = 100, message = "Название категории не может превышать 100 символов")
    private String name;

    @Size(max = 120, message = "Slug не может превышать 120 символов")
    private String slug;

    @Builder.Default
    private Integer sortOrder = 0;

    @Builder.Default
    private Boolean isVisible = true;
}
