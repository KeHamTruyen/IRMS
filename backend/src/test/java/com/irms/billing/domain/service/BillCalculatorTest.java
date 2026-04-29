package com.irms.billing.domain.service;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;

class BillCalculatorTest {

    private final BillCalculator calculator = new BillCalculator();

    @Test
    void calculateShouldApplyTaxServiceChargeAndDiscount() {
        BillCalculator.BillCalculationInput input = BillCalculator.BillCalculationInput.builder()
                .subtotal(new BigDecimal("100.00"))
                .taxRate(new BigDecimal("0.10"))
                .serviceChargeRate(new BigDecimal("0.05"))
                .discount(new BigDecimal("10.00"))
                .build();

        BillCalculator.BillCalculationResult result = calculator.calculate(input);

        assertEquals(new BigDecimal("100.00"), result.getSubtotal());
        assertEquals(new BigDecimal("10.0000"), result.getTax());
        assertEquals(new BigDecimal("5.0000"), result.getServiceCharge());
        assertEquals(new BigDecimal("10.00"), result.getDiscount());
        assertEquals(new BigDecimal("105.0000"), result.getTotalAmount());
    }

    @Test
    void recalculateTotalShouldReturnCombinedAmount() {
        BigDecimal total = calculator.recalculateTotal(
                new BigDecimal("200.00"),
                new BigDecimal("20.00"),
                new BigDecimal("10.00"),
                new BigDecimal("15.00")
        );

        assertEquals(new BigDecimal("215.00"), total);
    }
}