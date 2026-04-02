package com.irms.billing.domain.strategy.discount;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;

/**
 * Membership discount strategy
 * 
 * OCP: New strategy added without modifying existing code
 * 
 * Different member tiers get different discount rates
 */
@Component
public class MembershipDiscountStrategy implements DiscountStrategy {
    
    // Discount rates by member tier
    private static final Map<String, BigDecimal> TIER_DISCOUNT_RATES = Map.of(
        "BRONZE", new BigDecimal("0.05"),   // 5% off
        "SILVER", new BigDecimal("0.10"),   // 10% off
        "GOLD", new BigDecimal("0.15"),     // 15% off
        "PLATINUM", new BigDecimal("0.20")  // 20% off
    );
    
    @Override
    public BigDecimal calculateDiscount(DiscountContext context) {
        if (!isValid(context)) {
            return BigDecimal.ZERO;
        }
        
        String tier = context.getMemberTier().toUpperCase();
        BigDecimal discountRate = TIER_DISCOUNT_RATES.getOrDefault(tier, BigDecimal.ZERO);
        
        return context.getSubtotal()
                .multiply(discountRate)
                .setScale(2, RoundingMode.HALF_UP);
    }
    
    @Override
    public String getDiscountType() {
        return "MEMBERSHIP";
    }
    
    @Override
    public boolean isValid(DiscountContext context) {
        if (!context.isMemberCustomer()) {
            return false;
        }
        
        if (context.getMemberTier() == null || context.getMemberTier().isBlank()) {
            return false;
        }
        
        // Check if tier is recognized
        return TIER_DISCOUNT_RATES.containsKey(context.getMemberTier().toUpperCase());
    }
}
