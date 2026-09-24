package com.marziyagold.dto;

import com.marziyagold.entity.InquiryStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InquiryStatusHistoryDto {
    private Long id;
    private InquiryStatus oldStatus;
    private InquiryStatus newStatus;
    private String changedBy;
    private LocalDateTime changedAt;
}
