package com.irms.billing.domain.strategy;

import com.irms.order.domain.entity.OrderType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Delivery bill calculation strategy
 * 
 * OCP: New strategy added without modifying existing code
 * 
 * Rule: Delivery orders have delivery fee based on distance
 * Formula: Total = Subtotal + Tax + ServiceCharge + DeliveryFee - Discount
 */
@Component
@Order(10)  // Higher priority than standard
public class DeliveryBillCalculationStrategy implements BillCalculationStrategy {
    
    @Value("${app.delivery.base-fee:5.00}")
    private BigDecimal baseFee;
    
    @Value("${app.delivery.per-km-fee:1.50}")
    private BigDecimal perKmFee;
    
    @Override
    public BillCalculationResult calculate(BillCalculationContext context) {
        BigDecimal tax = context.getSubtotal().multiply(context.getTaxRate());
        BigDecimal serviceCharge = context.getSubtotal().multiply(context.getServiceChargeRate());
        
        // ✅ Calculate delivery fee based on distance
        BigDecimal deliveryFee = calculateDeliveryFee(context.getDeliveryDistanceKm());
        
        BigDecimal totalAmount = context.getSubtotal()
                .add(tax)
                .add(serviceCharge)
                .add(deliveryFee)  // ✅ Add delivery fee
                .subtract(context.getDiscount());
        
        return BillCalculationResult.builder()
                .subtotal(context.getSubtotal())
                .tax(tax)
                .serviceCharge(serviceCharge)
                .discount(context.getDiscount())
                .deliveryFee(deliveryFee)
                .totalAmount(totalAmount)
                .strategyUsed(getStrategyName())
                .build();
    }
    
    private BigDecimal calculateDeliveryFee(Double distanceKm) {
        if (distanceKm == null || distanceKm <= 0) {
            return baseFee;
        }
        
        BigDecimal distance = BigDecimal.valueOf(distanceKm);
        return baseFee.add(perKmFee.multiply(distance));
    }
    
    @Override
    public String getStrategyName() {
        return "DELIVERY";
    }
    
    @Override
    public boolean appliesTo(BillCalculationContext context) {
        return context.getOrderType() == OrderType.DELIVERY;
    }
}
