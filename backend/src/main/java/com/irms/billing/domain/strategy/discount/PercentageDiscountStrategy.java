package com.irms.billing.domain.strategy.discount;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Percentage discount strategy
 * 
 * OCP: New strategy added without modifying existing code
 * 
 * Example: 10% off means discountValue = 0.10
 */
@Component
public class PercentageDiscountStrategy implements DiscountStrategy {
    
    private static final BigDecimal MAX_PERCENTAGE = new BigDecimal("1.00");  // 100%
    
    @Override
    public BigDecimal calculateDiscount(DiscountContext context) {
        if (!isValid(context)) {
            return BigDecimal.ZERO;
        }
        
        // Calculate percentage discount
        BigDecimal discount = context.getSubtotal()
                .multiply(context.getDiscountValue())
                .setScale(2, RoundingMode.HALF_UP);
        
        return discount;
    }
    
    @Override
    public String getDiscountType() {
        return "PERCENTAGE";
    }
    
    @Override
    public boolean isValid(DiscountContext context) {
        if (context.getDiscountValue() == null) {
            return false;
        }
        
        // Discount must be between 0% and 100%
        return context.getDiscountValue().compareTo(BigDecimal.ZERO) >= 0 
                && context.getDiscountValue().compareTo(MAX_PERCENTAGE) <= 0;
    }
}
