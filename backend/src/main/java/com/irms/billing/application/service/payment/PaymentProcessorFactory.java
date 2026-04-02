package com.irms.billing.application.service.payment;

import com.irms.billing.domain.entity.PaymentMethod;
import com.irms.billing.domain.service.PaymentProcessor;
import com.irms.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Factory for payment processors (Factory Pattern + Strategy Pattern)
 * Demonstrates Open/Closed Principle - can add new payment methods without modifying this class
 */
@Component
@RequiredArgsConstructor
public class PaymentProcessorFactory {
    
    private final List<PaymentProcessor> paymentProcessors;
    
    /**
     * Get appropriate payment processor based on payment method
     * @param paymentMethod Payment method
     * @return PaymentProcessor implementation
     * @throws BusinessException if no processor found
     */
    public PaymentProcessor getProcessor(PaymentMethod paymentMethod) {
        Map<PaymentMethod, PaymentProcessor> processorMap = paymentProcessors.stream()
                .collect(Collectors.toMap(
                        PaymentProcessor::getSupportedMethod,
                        Function.identity()
                ));
        
        PaymentProcessor processor = processorMap.get(paymentMethod);
        
        if (processor == null) {
            throw new BusinessException("No payment processor found for method: " + paymentMethod);
        }
        
        return processor;
    }
}
