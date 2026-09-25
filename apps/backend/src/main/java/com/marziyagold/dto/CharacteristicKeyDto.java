package com.marziyagold.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CharacteristicKeyDto {

    private Long id;
    private String name;
    private Integer sortOrder;
    private Boolean isFilterable;
}
