package com.irms.billing.domain.service;

import com.irms.billing.domain.entity.Payment;
import com.irms.billing.domain.entity.PaymentMethod;

import java.math.BigDecimal;

/**
 * Strategy interface for payment processing (OCP, LSP, DIP)
 * Allows adding new payment methods without modifying existing code
 */
public interface PaymentProcessor {
    
    /**
     * Process payment transaction
     * @param payment Payment entity
     * @param amount Amount to process
     * @return true if payment succeeds, false otherwise
     */
    boolean processPayment(Payment payment, BigDecimal amount);
    
    /**
     * Validate payment before processing
     * @param amount Amount to validate
     * @return true if valid
     */
    boolean validatePayment(BigDecimal amount);
    
    /**
     * Get supported payment method
     * @return PaymentMethod enum
     */
    PaymentMethod getSupportedMethod();
}
