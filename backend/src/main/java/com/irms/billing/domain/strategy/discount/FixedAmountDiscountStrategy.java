package com.irms.billing.domain.strategy.discount;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Fixed amount discount strategy
 * 
 * OCP: New strategy added without modifying existing code
 * 
 * Example: $50 off means discountValue = 50.00
 */
@Component
public class FixedAmountDiscountStrategy implements DiscountStrategy {
    
    @Override
    public BigDecimal calculateDiscount(DiscountContext context) {
        if (!isValid(context)) {
            return BigDecimal.ZERO;
        }
        
        BigDecimal discountValue = context.getDiscountValue();
        
        // Discount cannot exceed subtotal
        if (discountValue.compareTo(context.getSubtotal()) > 0) {
            return context.getSubtotal();  // Cap at subtotal
        }
        
        return discountValue;
    }
    
    @Override
    public String getDiscountType() {
        return "FIXED";
    }
    
    @Override
    public boolean isValid(DiscountContext context) {
        if (context.getDiscountValue() == null) {
            return false;
        }
        
        // Discount must be positive
        return context.getDiscountValue().compareTo(BigDecimal.ZERO) > 0;
    }
}
