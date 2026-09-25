package com.marziyagold.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryAdminResponse {

    private Long id;
    private String name;
    private String slug;
    private Integer sortOrder;
    private Boolean isVisible;
    private LocalDateTime createdAt;
}
