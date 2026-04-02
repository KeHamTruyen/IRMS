package com.irms.billing.application.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateBillRequest {
    
    @NotNull(message = "Order ID is required")
    private Long orderId;
    
    @Builder.Default
    private BigDecimal discount = BigDecimal.ZERO;
}
