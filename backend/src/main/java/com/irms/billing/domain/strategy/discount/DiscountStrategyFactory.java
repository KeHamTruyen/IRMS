package com.irms.billing.domain.strategy.discount;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Factory for selecting appropriate discount strategy
 * 
 * OCP: Can add new discount types by:
 * 1. Create new class implementing DiscountStrategy
 * 2. Annotate with @Component
 * NO modification to this factory needed!
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DiscountStrategyFactory {
    
    /**
     * Spring automatically injects ALL DiscountStrategy beans
     * ✅ OCP: New strategies are auto-discovered!
     */
    private final List<DiscountStrategy> strategies;
    
    /**
     * Get strategy by discount type
     * 
     * @param discountType Discount type (NONE, PERCENTAGE, FIXED, COUPON, MEMBERSHIP)
     * @return Discount strategy
     */
    public DiscountStrategy getStrategy(String discountType) {
        if (discountType == null || discountType.isBlank()) {
            return getDefaultStrategy();
        }
        
        return strategies.stream()
                .filter(s -> s.getDiscountType().equalsIgnoreCase(discountType))
                .findFirst()
                .orElseGet(() -> {
                    log.warn("No discount strategy found for type: {}, using default", discountType);
                    return getDefaultStrategy();
                });
    }
    
    /**
     * Get default strategy (no discount)
     * 
     * @return Default discount strategy
     */
    private DiscountStrategy getDefaultStrategy() {
        return strategies.stream()
                .filter(s -> s.getDiscountType().equals("NONE"))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("NoDiscountStrategy not found"));
    }
    
    /**
     * Get all available discount strategies
     * 
     * @return List of all strategies
     */
    public List<DiscountStrategy> getAllStrategies() {
        return List.copyOf(strategies);
    }
}
