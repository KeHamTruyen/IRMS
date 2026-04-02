package com.irms.billing.domain.strategy.discount;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Context object for discount calculation
 */
@Data
@Builder
public class DiscountContext {
    
    /**
     * Subtotal amount (before discount)
     */
    private BigDecimal subtotal;
    
    /**
     * Discount type requested
     */
    private String discountType;
    
    /**
     * Discount value (meaning depends on type)
     * - For PERCENTAGE: 0.10 means 10%
     * - For FIXED: 50.00 means $50
     * - For COUPON: not used (looked up from database)
     */
    private BigDecimal discountValue;
    
    /**
     * Coupon code (for COUPON type)
     */
    private String couponCode;
    
    /**
     * Is member customer (for MEMBERSHIP type)
     */
    @Builder.Default
    private boolean isMemberCustomer = false;
    
    /**
     * Member tier (BRONZE, SILVER, GOLD, PLATINUM)
     */
    private String memberTier;
}
