package com.irms.billing.domain.service;

import com.irms.billing.domain.entity.BillStatus;
import com.irms.billing.domain.entity.Payment;
import com.irms.billing.domain.entity.PaymentStatus;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PaymentStatusCalculatorTest {

    private final PaymentStatusCalculator calculator = new PaymentStatusCalculator();

    @Test
    void calculateBillStatusShouldReturnPendingWhenNoCompletedPaymentsExist() {
        BillStatus status = calculator.calculateBillStatus(
                List.of(payment(new BigDecimal("10.00"), PaymentStatus.PENDING)),
                new BigDecimal("100.00")
        );

        assertEquals(BillStatus.PENDING, status);
    }

    @Test
    void calculateBillStatusShouldReturnPartiallyPaidWhenSomeAmountWasPaid() {
        BillStatus status = calculator.calculateBillStatus(
                List.of(payment(new BigDecimal("40.00"), PaymentStatus.COMPLETED)),
                new BigDecimal("100.00")
        );

        assertEquals(BillStatus.PARTIALLY_PAID, status);
    }

    @Test
    void calculateBillStatusShouldReturnPaidWhenPaymentsCoverBillTotal() {
        BillStatus status = calculator.calculateBillStatus(
                List.of(
                        payment(new BigDecimal("60.00"), PaymentStatus.COMPLETED),
                        payment(new BigDecimal("45.00"), PaymentStatus.COMPLETED)
                ),
                new BigDecimal("100.00")
        );

        assertEquals(BillStatus.PAID, status);
    }

    @Test
    void totalPaidShouldIgnoreNonCompletedPayments() {
        BigDecimal totalPaid = calculator.calculateTotalPaid(List.of(
                payment(new BigDecimal("25.00"), PaymentStatus.COMPLETED),
                payment(new BigDecimal("40.00"), PaymentStatus.FAILED)
        ));

        assertEquals(new BigDecimal("25.00"), totalPaid);
        assertTrue(calculator.isFullyPaid(List.of(payment(new BigDecimal("100.00"), PaymentStatus.COMPLETED)), new BigDecimal("100.00")));
        assertFalse(calculator.isFullyPaid(List.of(payment(new BigDecimal("99.99"), PaymentStatus.COMPLETED)), new BigDecimal("100.00")));
    }

    private Payment payment(BigDecimal amount, PaymentStatus status) {
        return Payment.builder()
                .amount(amount)
                .status(status)
                .build();
    }
}