package com.marziyagold.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.marziyagold.entity.InquiryStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InquiryDetailDto {

    private Long id;
    private String clientName;
    private String clientPhone;
    private String comment;
    private InquiryStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Builder.Default
    private List<InquiryItemDetailDto> items = new ArrayList<>();

    @Builder.Default
    @JsonProperty("history")
    private List<InquiryStatusHistoryDto> history = new ArrayList<>();

    @JsonProperty("statusHistory")
    public List<InquiryStatusHistoryDto> getStatusHistory() {
        return history;
    }
}
