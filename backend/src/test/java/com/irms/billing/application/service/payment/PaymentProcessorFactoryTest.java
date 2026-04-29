package com.irms.billing.application.service.payment;

import com.irms.billing.domain.entity.PaymentMethod;
import com.irms.billing.domain.service.PaymentProcessor;
import com.irms.common.exception.BusinessException;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class PaymentProcessorFactoryTest {

    @Test
    void getProcessorShouldReturnMatchingImplementation() {
        PaymentProcessor cashProcessor = mock(PaymentProcessor.class);
        PaymentProcessor cardProcessor = mock(PaymentProcessor.class);
        when(cashProcessor.getSupportedMethod()).thenReturn(PaymentMethod.CASH);
        when(cardProcessor.getSupportedMethod()).thenReturn(PaymentMethod.CREDIT_CARD);

        PaymentProcessorFactory factory = new PaymentProcessorFactory(List.of(cashProcessor, cardProcessor));

        assertSame(cardProcessor, factory.getProcessor(PaymentMethod.CREDIT_CARD));
    }

    @Test
    void getProcessorShouldThrowWhenMethodIsNotRegistered() {
        PaymentProcessor cashProcessor = mock(PaymentProcessor.class);
        when(cashProcessor.getSupportedMethod()).thenReturn(PaymentMethod.CASH);

        PaymentProcessorFactory factory = new PaymentProcessorFactory(List.of(cashProcessor));

        assertThrows(BusinessException.class, () -> factory.getProcessor(PaymentMethod.DIGITAL_WALLET));
    }
}