package com.irms.billing.domain.strategy;

import com.irms.order.domain.entity.OrderType;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Standard bill calculation strategy
 * 
 * OCP: Can add new strategies without modifying this one
 * 
 * Formula: Total = Subtotal + Tax + ServiceCharge - Discount
 */
@Component
@Order(999)  // Lowest priority - fallback strategy
public class StandardBillCalculationStrategy implements BillCalculationStrategy {
    
    @Override
    public BillCalculationResult calculate(BillCalculationContext context) {
        BigDecimal tax = context.getSubtotal().multiply(context.getTaxRate());
        BigDecimal serviceCharge = context.getSubtotal().multiply(context.getServiceChargeRate());
        BigDecimal totalAmount = context.getSubtotal()
                .add(tax)
                .add(serviceCharge)
                .subtract(context.getDiscount());
        
        return BillCalculationResult.builder()
                .subtotal(context.getSubtotal())
                .tax(tax)
                .serviceCharge(serviceCharge)
                .discount(context.getDiscount())
                .deliveryFee(BigDecimal.ZERO)
                .totalAmount(totalAmount)
                .strategyUsed(getStrategyName())
                .build();
    }
    
    @Override
    public String getStrategyName() {
        return "STANDARD";
    }
    
    @Override
    public boolean appliesTo(BillCalculationContext context) {
        // Default strategy - always applies as fallback
        return context.getOrderType() == OrderType.DINE_IN;
    }
}
