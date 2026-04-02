package com.irms.billing.domain.strategy;

import com.irms.order.domain.entity.OrderType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalTime;

/**
 * Happy Hour bill calculation strategy
 * 
 * OCP: New strategy added without modifying existing code
 * 
 * Rule: Orders during happy hour get automatic discount
 * Formula: Total = Subtotal + Tax + ServiceCharge - HappyHourDiscount - AdditionalDiscount
 */
@Component
@Order(5)  // Highest priority - checked first
public class HappyHourBillCalculationStrategy implements BillCalculationStrategy {
    
    @Value("${app.happy-hour.start-time:16:00}")
    private String happyHourStartTime;
    
    @Value("${app.happy-hour.end-time:18:00}")
    private String happyHourEndTime;
    
    @Value("${app.happy-hour.discount-rate:0.20}")
    private BigDecimal happyHourDiscountRate;  // 20% discount
    
    @Override
    public BillCalculationResult calculate(BillCalculationContext context) {
        // Calculate happy hour discount
        BigDecimal happyHourDiscount = context.getSubtotal().multiply(happyHourDiscountRate);
        BigDecimal totalDiscount = happyHourDiscount.add(context.getDiscount());
        
        BigDecimal tax = context.getSubtotal().multiply(context.getTaxRate());
        BigDecimal serviceCharge = context.getSubtotal().multiply(context.getServiceChargeRate());
        
        BigDecimal totalAmount = context.getSubtotal()
                .add(tax)
                .add(serviceCharge)
                .subtract(totalDiscount);  // ✅ Apply happy hour + additional discount
        
        return BillCalculationResult.builder()
                .subtotal(context.getSubtotal())
                .tax(tax)
                .serviceCharge(serviceCharge)
                .discount(totalDiscount)
                .deliveryFee(BigDecimal.ZERO)
                .totalAmount(totalAmount)
                .strategyUsed(getStrategyName())
                .build();
    }
    
    @Override
    public String getStrategyName() {
        return "HAPPY_HOUR";
    }
    
    @Override
    public boolean appliesTo(BillCalculationContext context) {
        // Only apply to dine-in during happy hour
        if (context.getOrderType() != OrderType.DINE_IN) {
            return false;
        }
        
        if (context.getOrderTime() == null) {
            return false;
        }
        
        LocalTime orderTime = context.getOrderTime().toLocalTime();
        LocalTime startTime = LocalTime.parse(happyHourStartTime);
        LocalTime endTime = LocalTime.parse(happyHourEndTime);
        
        return !orderTime.isBefore(startTime) && !orderTime.isAfter(endTime);
    }
}
