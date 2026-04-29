package com.irms.order.domain.service;

import com.irms.common.exception.BusinessException;
import com.irms.order.domain.entity.OrderStatus;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class OrderStatusTransitionValidatorTest {

    private final OrderStatusTransitionValidator validator = new OrderStatusTransitionValidator();

    @Test
    void validateTransitionShouldAllowValidProgression() {
        assertDoesNotThrow(() -> validator.validateTransition(OrderStatus.PENDING, OrderStatus.CONFIRMED));
        assertDoesNotThrow(() -> validator.validateTransition(OrderStatus.CONFIRMED, OrderStatus.PREPARING));
        assertDoesNotThrow(() -> validator.validateTransition(OrderStatus.PREPARING, OrderStatus.READY));
        assertDoesNotThrow(() -> validator.validateTransition(OrderStatus.READY, OrderStatus.SERVED));
        assertDoesNotThrow(() -> validator.validateTransition(OrderStatus.SERVED, OrderStatus.COMPLETED));
    }

    @Test
    void validateTransitionShouldRejectInvalidProgression() {
        assertThrows(BusinessException.class, () -> validator.validateTransition(OrderStatus.READY, OrderStatus.PENDING));
    }

    @Test
    void validateTransitionShouldRejectTerminalStateChanges() {
        assertThrows(BusinessException.class, () -> validator.validateTransition(OrderStatus.COMPLETED, OrderStatus.PENDING));
        assertThrows(BusinessException.class, () -> validator.validateTransition(OrderStatus.CANCELLED, OrderStatus.CONFIRMED));
    }
}