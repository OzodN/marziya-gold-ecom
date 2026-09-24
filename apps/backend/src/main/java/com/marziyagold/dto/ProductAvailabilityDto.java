package com.marziyagold.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductAvailabilityDto {
    private Long productId;
    private Boolean isAvailable;
    private String name;
    private String sku;
    private String mainImageUrl;
}
