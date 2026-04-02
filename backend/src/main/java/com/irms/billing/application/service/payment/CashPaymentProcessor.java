package com.irms.billing.application.service.payment;

import com.irms.billing.domain.entity.Payment;
import com.irms.billing.domain.entity.PaymentMethod;
import com.irms.billing.domain.entity.PaymentStatus;
import com.irms.billing.domain.service.PaymentProcessor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Cash payment strategy implementation
 */
@Slf4j
@Component
public class CashPaymentProcessor implements PaymentProcessor {
    
    @Override
    public boolean processPayment(Payment payment, BigDecimal amount) {
        log.info("Processing CASH payment: {} for amount: {}", payment.getId(), amount);
        
        // Cash payment is always successful (no external validation needed)
        payment.markAsCompleted();
        
        log.info("CASH payment processed successfully");
        return true;
    }
    
    @Override
    public boolean validatePayment(BigDecimal amount) {
        // Cash payment validation: amount must be positive
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            log.error("Invalid cash amount: {}", amount);
            return false;
        }
        return true;
    }
    
    @Override
    public PaymentMethod getSupportedMethod() {
        return PaymentMethod.CASH;
    }
}
