package com.irms.billing.application.service.payment;

import com.irms.billing.domain.entity.Payment;
import com.irms.billing.domain.entity.PaymentMethod;
import com.irms.billing.domain.entity.PaymentStatus;
import com.irms.billing.domain.service.PaymentProcessor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Card payment strategy implementation
 * Simulates card payment gateway integration
 */
@Slf4j
@Component
public class CardPaymentProcessor implements PaymentProcessor {
    
    private static final BigDecimal MAX_CARD_AMOUNT = new BigDecimal("50000000"); // 50M VND
    
    @Override
    public boolean processPayment(Payment payment, BigDecimal amount) {
        log.info("Processing CARD payment: {} for amount: {}", payment.getId(), amount);
        
        try {
            // Simulate card gateway processing
            boolean cardApproved = simulateCardGateway(amount);
            
            if (cardApproved) {
                payment.markAsCompleted();
                log.info("CARD payment approved and processed successfully");
                return true;
            } else {
                payment.setStatus(PaymentStatus.FAILED);
                log.warn("CARD payment declined by gateway");
                return false;
            }
            
        } catch (Exception e) {
            log.error("Error processing CARD payment: {}", e.getMessage());
            payment.setStatus(PaymentStatus.FAILED);
            return false;
        }
    }
    
    @Override
    public boolean validatePayment(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            log.error("Invalid card payment amount: {}", amount);
            return false;
        }
        
        if (amount.compareTo(MAX_CARD_AMOUNT) > 0) {
            log.error("Card payment amount exceeds maximum: {} > {}", amount, MAX_CARD_AMOUNT);
            return false;
        }
        
        return true;
    }
    
    @Override
    public PaymentMethod getSupportedMethod() {
        return PaymentMethod.CREDIT_CARD;
    }
    
    /**
     * Simulate card payment gateway
     * In production, this would integrate with real payment gateway (Stripe, VNPay, etc.)
     */
    private boolean simulateCardGateway(BigDecimal amount) {
        // Simulate 95% success rate
        return Math.random() > 0.05;
    }
}
