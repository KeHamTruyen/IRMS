package com.irms.order.domain.service;

import com.irms.common.exception.BusinessException;
import com.irms.order.domain.entity.Order;
import com.irms.order.domain.entity.OrderType;
import org.springframework.stereotype.Component;

/**
 * SRP: Single responsibility - validate orders
 * Extracted from Order entity to achieve 100% SOLID compliance
 */
@Component
public class OrderValidator {
    
    /**
     * Validate order business rules
     * 
     * @param order Order to validate
     * @throws BusinessException if validation fails
     */
    public void validate(Order order) {
        validateHasItems(order);
        validateDineInHasTable(order);
    }
    
    /**
     * Validate order has at least one item
     */
    private void validateHasItems(Order order) {
        if (order.getItems() == null || order.getItems().isEmpty()) {
            throw new BusinessException("Order must have at least one item");
        }
    }
    
    /**
     * Validate dine-in orders have table assigned
     */
    private void validateDineInHasTable(Order order) {
        if (order.getOrderType() == OrderType.DINE_IN && order.getTableId() == null) {
            throw new BusinessException("Dine-in orders must have a table assigned");
        }
    }
    
    /**
     * Validate order can be cancelled
     * 
     * @param order Order to check
     * @return true if order can be cancelled
     */
    public boolean canBeCancelled(Order order) {
        return order.getStatus() == com.irms.order.domain.entity.OrderStatus.PENDING 
                || order.getStatus() == com.irms.order.domain.entity.OrderStatus.CONFIRMED;
    }
}
