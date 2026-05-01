package com.irms.order.domain.service;

import com.irms.order.domain.entity.OrderItem;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;

/**
 * SRP: Single responsibility - calculate order totals
 * Extracted from Order entity to achieve 100% SOLID compliance
 */
@Component
public class OrderCalculator {
    
    /**
     * Calculate total amount from order items
     * 
     * @param items List of order items
     * @return Total amount
     */
    public BigDecimal calculateTotal(List<OrderItem> items) {
        if (items == null || items.isEmpty()) {
            return BigDecimal.ZERO;
        }
        
        return items.stream()
                .map(OrderItem::getSubtotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
