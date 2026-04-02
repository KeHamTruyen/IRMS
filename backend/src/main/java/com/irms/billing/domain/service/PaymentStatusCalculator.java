package com.irms.billing.domain.service;

import com.irms.billing.domain.entity.BillStatus;
import com.irms.billing.domain.entity.Payment;
import com.irms.billing.domain.entity.PaymentStatus;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

/**
 * SRP: Single responsibility - calculate payment status
 * Extracted from Bill entity to achieve 100% SOLID compliance
 */
@Component
public class PaymentStatusCalculator {
    
    /**
     * Calculate bill status based on payments
     * 
     * @param payments List of payments
     * @param billTotalAmount Total bill amount
     * @return Calculated bill status
     */
    public BillStatus calculateBillStatus(List<Payment> payments, BigDecimal billTotalAmount) {
        BigDecimal totalPaid = calculateTotalPaid(payments);
        
        if (totalPaid.compareTo(billTotalAmount) >= 0) {
            return BillStatus.PAID;
        } else if (totalPaid.compareTo(BigDecimal.ZERO) > 0) {
            return BillStatus.PARTIALLY_PAID;
        } else {
            return BillStatus.PENDING;
        }
    }
    
    /**
     * Calculate total amount paid from completed payments
     * 
     * @param payments List of payments
     * @return Total paid amount
     */
    public BigDecimal calculateTotalPaid(List<Payment> payments) {
        return payments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.COMPLETED)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    /**
     * Check if bill is fully paid
     * 
     * @param payments List of payments
     * @param billTotalAmount Total bill amount
     * @return true if fully paid
     */
    public boolean isFullyPaid(List<Payment> payments, BigDecimal billTotalAmount) {
        BigDecimal totalPaid = calculateTotalPaid(payments);
        return totalPaid.compareTo(billTotalAmount) >= 0;
    }
}
