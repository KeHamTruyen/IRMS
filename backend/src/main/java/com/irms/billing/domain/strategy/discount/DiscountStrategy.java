package com.irms.billing.domain.strategy.discount;

import java.math.BigDecimal;

/**
 * OCP: Open for extension, closed for modification
 * 
 * Strategy interface for discount calculation
 * Different discount types can be added without modifying existing code
 */
public interface DiscountStrategy {
    
    /**
     * Calculate discount amount
     * 
     * @param context Discount context with input data
     * @return Discount amount
     */
    BigDecimal calculateDiscount(DiscountContext context);
    
    /**
     * Get discount type name
     * 
     * @return Discount type (e.g., "NONE", "PERCENTAGE", "FIXED", "COUPON")
     */
    String getDiscountType();
    
    /**
     * Validate discount can be applied
     * 
     * @param context Discount context
     * @return true if discount is valid
     */
    boolean isValid(DiscountContext context);
}
