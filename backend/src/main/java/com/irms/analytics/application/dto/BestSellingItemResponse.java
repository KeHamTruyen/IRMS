package com.irms.analytics.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BestSellingItemResponse {

    private Long menuItemId;
    private String itemName;
    private Long totalQuantity;
}
