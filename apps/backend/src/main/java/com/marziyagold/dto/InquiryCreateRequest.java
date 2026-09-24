package com.marziyagold.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
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
public class InquiryCreateRequest {

    @NotBlank(message = "Имя клиента обязательно для заполнения")
    private String clientName;

    @NotBlank(message = "Номер телефона обязателен для связи")
    private String clientPhone;

    private String comment;

    @NotEmpty(message = "Подборка не может быть пустой")
    @Builder.Default
    private List<@Valid InquiryItemRequest> items = new ArrayList<>();
}
