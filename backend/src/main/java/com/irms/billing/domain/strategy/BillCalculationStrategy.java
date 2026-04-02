package com.irms.billing.domain.strategy;

import java.math.BigDecimal;

/**
 * OCP: Open for extension, closed for modification
 * 
 * Strategy interface for bill calculation
 * Different calculation strategies can be added without modifying existing code
 */
public interface BillCalculationStrategy {
    
    /**
     * Calculate bill with specific strategy
     * 
     * @param context Calculation context with input data
     * @return Calculation result
     */
    BillCalculationResult calculate(BillCalculationContext context);
    
    /**
     * Get strategy name
     * 
     * @return Strategy name (e.g., "STANDARD", "HAPPY_HOUR", "DELIVERY")
     */
    String getStrategyName();
    
    /**
     * Check if this strategy applies to the given context
     * 
     * @param context Calculation context
     * @return true if this strategy should be used
     */
    boolean appliesTo(BillCalculationContext context);
}
