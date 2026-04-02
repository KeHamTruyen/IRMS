package com.irms.billing.domain.strategy;

import com.irms.order.domain.entity.OrderType;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Takeaway bill calculation strategy
 * 
 * OCP: New strategy added without modifying existing code
 * 
 * Rule: Takeaway orders have NO service charge
 * Formula: Total = Subtotal + Tax - Discount
 */
@Component
@Order(10)  // Higher priority than standard
public class TakeawayBillCalculationStrategy implements BillCalculationStrategy {
    
    @Override
    public BillCalculationResult calculate(BillCalculationContext context) {
        BigDecimal tax = context.getSubtotal().multiply(context.getTaxRate());
        BigDecimal serviceCharge = BigDecimal.ZERO;  // ✅ No service charge for takeaway
        BigDecimal totalAmount = context.getSubtotal()
                .add(tax)
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
        return "TAKEAWAY";
    }
    
    @Override
    public boolean appliesTo(BillCalculationContext context) {
        return context.getOrderType() == OrderType.TAKEAWAY;
    }
}
