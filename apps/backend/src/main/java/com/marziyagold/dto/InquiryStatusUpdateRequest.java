package com.marziyagold.dto;

import com.marziyagold.entity.InquiryStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InquiryStatusUpdateRequest {

    @NotNull(message = "Статус обязателен")
    private InquiryStatus status;

    private String comment;
}
