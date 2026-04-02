package com.irms.order.domain.service;

import com.irms.common.exception.BusinessException;
import com.irms.order.domain.entity.OrderStatus;
import org.springframework.stereotype.Component;

/**
 * SRP: Single responsibility - validate order status transitions
 * Extracted from Order entity to achieve 100% SOLID compliance
 * 
 * OCP: Can be extended with new transition rules without modification
 */
@Component
public class OrderStatusTransitionValidator {
    
    /**
     * Validate status transition is allowed
     * 
     * @param currentStatus Current order status
     * @param newStatus New order status
     * @throws BusinessException if transition is not allowed
     */
    public void validateTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        if (currentStatus == OrderStatus.COMPLETED || currentStatus == OrderStatus.CANCELLED) {
            throw new BusinessException(
                "Cannot change status of completed or cancelled order. Current: " 
                + currentStatus + ", Requested: " + newStatus
            );
        }
        
        // Additional transition rules can be added here
        validateLogicalTransition(currentStatus, newStatus);
    }
    
    /**
     * Validate logical progression of statuses
     * Prevents illogical transitions like READY → PENDING
     */
    private void validateLogicalTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        // Define valid transitions
        switch (currentStatus) {
            case PENDING:
                // From PENDING can go to: CONFIRMED, CANCELLED
                if (newStatus != OrderStatus.CONFIRMED && newStatus != OrderStatus.CANCELLED) {
                    throwInvalidTransition(currentStatus, newStatus);
                }
                break;
                
            case CONFIRMED:
                // From CONFIRMED can go to: PREPARING, CANCELLED
                if (newStatus != OrderStatus.PREPARING && newStatus != OrderStatus.CANCELLED) {
                    throwInvalidTransition(currentStatus, newStatus);
                }
                break;
                
            case PREPARING:
                // From PREPARING can go to: READY
                if (newStatus != OrderStatus.READY) {
                    throwInvalidTransition(currentStatus, newStatus);
                }
                break;
                
            case READY:
                // From READY can go to: SERVED
                if (newStatus != OrderStatus.SERVED) {
                    throwInvalidTransition(currentStatus, newStatus);
                }
                break;

            case SERVED:
                // From SERVED can go to: COMPLETED
                if (newStatus != OrderStatus.COMPLETED) {
                    throwInvalidTransition(currentStatus, newStatus);
                }
                break;
                
            case COMPLETED:
            case CANCELLED:
                // These are terminal states - already handled above
                break;
        }
    }
    
    private void throwInvalidTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        throw new BusinessException(
            "Invalid status transition from " + currentStatus + " to " + newStatus
        );
    }
}
