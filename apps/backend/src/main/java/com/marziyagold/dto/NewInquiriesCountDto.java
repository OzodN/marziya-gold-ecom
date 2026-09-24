package com.marziyagold.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewInquiriesCountDto {

    @JsonProperty("count")
    private long count;

    @JsonProperty("newCount")
    public long getNewCount() {
        return count;
    }
}
