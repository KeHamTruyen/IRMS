package com.irms.billing.application.service.payment;

import com.irms.billing.domain.entity.Payment;
import com.irms.billing.domain.entity.PaymentMethod;
import com.irms.billing.domain.entity.PaymentStatus;
import com.irms.billing.domain.service.PaymentProcessor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * E-Wallet payment strategy implementation
 * Simulates integration with Momo, ZaloPay, VNPay, etc.
 */
@Slf4j
@Component
public class EWalletPaymentProcessor implements PaymentProcessor {
    
    private static final BigDecimal MAX_EWALLET_AMOUNT = new BigDecimal("20000000"); // 20M VND
    
    @Override
    public boolean processPayment(Payment payment, BigDecimal amount) {
        log.info("Processing E-WALLET payment: {} for amount: {}", payment.getId(), amount);
        
        try {
            // Simulate e-wallet API call
            boolean walletApproved = simulateEWalletAPI(amount);
            
            if (walletApproved) {
                payment.markAsCompleted();
                log.info("E-WALLET payment processed successfully");
                return true;
            } else {
                payment.setStatus(PaymentStatus.FAILED);
                log.warn("E-WALLET payment failed - insufficient balance or timeout");
                return false;
            }
            
        } catch (Exception e) {
            log.error("Error processing E-WALLET payment: {}", e.getMessage());
            payment.setStatus(PaymentStatus.FAILED);
            return false;
        }
    }
    
    @Override
    public boolean validatePayment(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            log.error("Invalid e-wallet payment amount: {}", amount);
            return false;
        }
        
        if (amount.compareTo(MAX_EWALLET_AMOUNT) > 0) {
            log.error("E-wallet payment amount exceeds maximum: {} > {}", amount, MAX_EWALLET_AMOUNT);
            return false;
        }
        
        return true;
    }
    
    @Override
    public PaymentMethod getSupportedMethod() {
        return PaymentMethod.DIGITAL_WALLET;
    }
    
    /**
     * Simulate e-wallet API integration
     * In production, this would call real APIs (Momo, ZaloPay, VNPay)
     */
    private boolean simulateEWalletAPI(BigDecimal amount) {
        // Simulate 90% success rate (lower than card due to balance issues)
        return Math.random() > 0.10;
    }
}
