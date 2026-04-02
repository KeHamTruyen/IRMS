package com.irms.billing.domain.strategy;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Result of bill calculation
 */
@Data
@Builder
public class BillCalculationResult {
    
    /**
     * Subtotal amount
     */
    private BigDecimal subtotal;
    
    /**
     * Tax amount
     */
    private BigDecimal tax;
    
    /**
     * Service charge amount
     */
    private BigDecimal serviceCharge;
    
    /**
     * Discount amount
     */
    private BigDecimal discount;
    
    /**
     * Delivery fee (if applicable)
     */
    @Builder.Default
    private BigDecimal deliveryFee = BigDecimal.ZERO;
    
    /**
     * Total amount
     */
    private BigDecimal totalAmount;
    
    /**
     * Strategy used for calculation
     */
    private String strategyUsed;
}
