package com.irms.billing.domain.strategy;

import com.irms.order.domain.entity.OrderType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Context object for bill calculation
 * Contains all information needed for different calculation strategies
 */
@Data
@Builder
public class BillCalculationContext {
    
    /**
     * Subtotal amount (before tax, service charge, discount)
     */
    private BigDecimal subtotal;
    
    /**
     * Tax rate (e.g., 0.10 for 10%)
     */
    private BigDecimal taxRate;
    
    /**
     * Service charge rate (e.g., 0.05 for 5%)
     */
    private BigDecimal serviceChargeRate;
    
    /**
     * Discount amount
     */
    @Builder.Default
    private BigDecimal discount = BigDecimal.ZERO;
    
    /**
     * Order type (DINE_IN, TAKEAWAY, DELIVERY)
     */
    private OrderType orderType;
    
    /**
     * Order time (for happy hour detection)
     */
    private LocalDateTime orderTime;
    
    /**
     * Is member customer (for member discount)
     */
    @Builder.Default
    private boolean isMemberCustomer = false;
    
    /**
     * Delivery distance in km (for delivery fee calculation)
     */
    @Builder.Default
    private Double deliveryDistanceKm = 0.0;
}
