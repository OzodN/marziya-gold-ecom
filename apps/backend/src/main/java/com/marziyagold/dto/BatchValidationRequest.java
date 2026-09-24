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
public class BatchValidationRequest {
    @NotNull(message = "Список идентификаторов изделий не должен быть пустым")
    @Builder.Default
    private List<Long> productIds = new ArrayList<>();
}
