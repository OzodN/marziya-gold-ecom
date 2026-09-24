package com.marziyagold.dto;

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
public class FilterGroupDto {
    private String name;
    @Builder.Default
    private List<String> values = new ArrayList<>();
}
