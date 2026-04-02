package com.irms.billing.domain.service;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * SRP: Single responsibility - calculate bill totals
 * Extracted from Bill entity to achieve 100% SOLID compliance
 */
@Component
public class BillCalculator {
    
    /**
     * Calculate bill total with tax, service charge, and discount
     * 
     * @param input Calculation input parameters
     * @return Calculated bill result
     */
    public BillCalculationResult calculate(BillCalculationInput input) {
        BigDecimal tax = input.getSubtotal().multiply(input.getTaxRate());
        BigDecimal serviceCharge = input.getSubtotal().multiply(input.getServiceChargeRate());
        BigDecimal totalAmount = input.getSubtotal()
                .add(tax)
                .add(serviceCharge)
                .subtract(input.getDiscount());
        
        return BillCalculationResult.builder()
                .subtotal(input.getSubtotal())
                .tax(tax)
                .serviceCharge(serviceCharge)
                .discount(input.getDiscount())
                .totalAmount(totalAmount)
                .build();
    }
    
    /**
     * Recalculate total when discount changes
     */
    public BigDecimal recalculateTotal(BigDecimal subtotal, BigDecimal tax, 
                                       BigDecimal serviceCharge, BigDecimal discount) {
        return subtotal
                .add(tax)
                .add(serviceCharge)
                .subtract(discount);
    }
    
    /**
     * Input for bill calculation
     */
    @lombok.Data
    @lombok.Builder
    public static class BillCalculationInput {
        private BigDecimal subtotal;
        private BigDecimal taxRate;
        private BigDecimal serviceChargeRate;
        @lombok.Builder.Default
        private BigDecimal discount = BigDecimal.ZERO;
    }
    
    /**
     * Result of bill calculation
     */
    @lombok.Data
    @lombok.Builder
    public static class BillCalculationResult {
        private BigDecimal subtotal;
        private BigDecimal tax;
        private BigDecimal serviceCharge;
        private BigDecimal discount;
        private BigDecimal totalAmount;
    }
}
