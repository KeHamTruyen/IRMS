package com.irms.order.domain.service;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * SRP: Single responsibility - calculate order item subtotal
 * Extracted from OrderItem entity to achieve 100% SOLID compliance
 */
@Component
public class OrderItemCalculator {
    
    /**
     * Calculate subtotal for order item
     * 
     * @param unitPrice Unit price of menu item
     * @param quantity Quantity ordered
     * @return Calculated subtotal
     */
    public BigDecimal calculateSubtotal(BigDecimal unitPrice, Integer quantity) {
        if (unitPrice == null || quantity == null) {
            return BigDecimal.ZERO;
        }
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }
    
    /**
     * Validate quantity is positive
     * 
     * @param quantity Quantity to validate
     * @throws IllegalArgumentException if quantity is not positive
     */
    public void validateQuantity(Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }
    }
}
