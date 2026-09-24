package com.marziyagold.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductPageResponse {
    @Builder.Default
    private List<ProductSummaryDto> content = new ArrayList<>();
    private int page;
    private int pageNumber;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean last;

    public static ProductPageResponse from(Page<ProductSummaryDto> pageResult) {
        return ProductPageResponse.builder()
                .content(pageResult.getContent())
                .page(pageResult.getNumber())
                .pageNumber(pageResult.getNumber())
                .size(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .last(pageResult.isLast())
                .build();
    }
}
