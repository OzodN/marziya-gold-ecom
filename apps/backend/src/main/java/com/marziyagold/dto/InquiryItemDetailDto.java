package com.marziyagold.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InquiryItemDetailDto {

    private Long id;
    private Long productId;
    private Integer quantity;

    @JsonProperty("productSnapshot")
    private Map<String, Object> productSnapshot;

    @JsonProperty("snapshot")
    public Map<String, Object> getSnapshot() {
        return productSnapshot;
    }
}
