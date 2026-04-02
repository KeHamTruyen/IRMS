package com.irms.billing.application.service;

import com.irms.billing.application.dto.CreateBillRequest;
import com.irms.billing.application.dto.ProcessPaymentRequest;
import com.irms.billing.domain.entity.Bill;
import com.irms.billing.domain.entity.Payment;

import java.util.List;

/**
 * Billing service interface (ISP, DIP)
 * Focused interface for billing and payment operations
 */
public interface IBillingService {

    /**
     * Get all bills
     */
    List<Bill> getAllBills();

    /**
     * Get bill by ID
     */
    Bill getBillById(Long billId);
    
    /**
     * Create bill from order
     */
    Bill createBill(CreateBillRequest request);
    
    /**
     * Get bill by order ID
     */
    Bill getBillByOrderId(Long orderId);
    
    /**
     * Process payment for bill
     * Uses Strategy Pattern for different payment methods
     */
    Payment processPayment(ProcessPaymentRequest request);

    /**
     * Process payment for a specific bill.
     */
    default Payment processPayment(Long billId, ProcessPaymentRequest request) {
        request.setBillId(billId);
        return processPayment(request);
    }
}
