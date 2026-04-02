package com.irms.billing.application.mapper;

import com.irms.billing.application.dto.PaymentResponse;
import com.irms.billing.domain.entity.Payment;
import org.springframework.stereotype.Component;

/**
 * Payment mapper - separates mapping logic (SRP)
 */
@Component
public class PaymentMapper {
    
    /**
     * Map Payment entity to PaymentResponse DTO
     */
    public PaymentResponse toResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .billId(payment.getBill() != null ? payment.getBill().getId() : null)
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .status(payment.getStatus())
                .transactionId(payment.getTransactionId())
                .paidAt(payment.getProcessedAt())
                .createdAt(payment.getProcessedAt())
                .processedAt(payment.getProcessedAt())
                .processedBy(payment.getProcessedBy())
                .notes(payment.getNotes())
                .build();
    }
}
