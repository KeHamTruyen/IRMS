package com.irms.billing.domain.strategy.discount;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;

/**
 * Coupon discount strategy
 * 
 * OCP: New strategy added without modifying existing code
 * 
 * In production, this would look up coupons from database
 * For now, using in-memory mock data
 */
@Slf4j
@Component
public class CouponDiscountStrategy implements DiscountStrategy {
    
    // Mock coupon database (in production, use CouponRepository)
    private static final Map<String, CouponData> MOCK_COUPONS = Map.of(
        "WELCOME10", new CouponData("PERCENTAGE", new BigDecimal("0.10"), new BigDecimal("100.00")),
        "SAVE20", new CouponData("FIXED", new BigDecimal("20.00"), new BigDecimal("50.00")),
        "VIP25", new CouponData("PERCENTAGE", new BigDecimal("0.25"), new BigDecimal("200.00"))
    );
    
    @Override
    public BigDecimal calculateDiscount(DiscountContext context) {
        if (!isValid(context)) {
            return BigDecimal.ZERO;
        }
        
        CouponData coupon = MOCK_COUPONS.get(context.getCouponCode().toUpperCase());
        
        // Check minimum order amount
        if (context.getSubtotal().compareTo(coupon.minOrderAmount) < 0) {
            log.warn("Order amount {} is less than coupon minimum {}", 
                    context.getSubtotal(), coupon.minOrderAmount);
            return BigDecimal.ZERO;
        }
        
        // Calculate discount based on coupon type
        BigDecimal discount;
        if ("PERCENTAGE".equals(coupon.type)) {
            discount = context.getSubtotal()
                    .multiply(coupon.value)
                    .setScale(2, RoundingMode.HALF_UP);
        } else {
            discount = coupon.value;
        }
        
        // Discount cannot exceed subtotal
        if (discount.compareTo(context.getSubtotal()) > 0) {
            return context.getSubtotal();
        }
        
        return discount;
    }
    
    @Override
    public String getDiscountType() {
        return "COUPON";
    }
    
    @Override
    public boolean isValid(DiscountContext context) {
        if (context.getCouponCode() == null || context.getCouponCode().isBlank()) {
            return false;
        }
        
        // Check if coupon exists
        return MOCK_COUPONS.containsKey(context.getCouponCode().toUpperCase());
    }
    
    /**
     * Coupon data structure
     */
    private record CouponData(String type, BigDecimal value, BigDecimal minOrderAmount) {}
}
