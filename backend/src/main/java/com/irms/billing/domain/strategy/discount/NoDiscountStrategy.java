package com.irms.billing.domain.strategy.discount;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * No discount strategy
 * 
 * OCP: Can add new discount types without modifying this one
 */
@Component
public class NoDiscountStrategy implements DiscountStrategy {
    
    @Override
    public BigDecimal calculateDiscount(DiscountContext context) {
        return BigDecimal.ZERO;
    }
    
    @Override
    public String getDiscountType() {
        return "NONE";
    }
    
    @Override
    public boolean isValid(DiscountContext context) {
        return true;  // Always valid
    }
}
