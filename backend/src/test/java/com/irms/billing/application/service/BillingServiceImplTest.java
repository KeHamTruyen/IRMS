package com.irms.billing.application.service;

import com.irms.billing.application.dto.CreateBillRequest;
import com.irms.billing.application.dto.ProcessPaymentRequest;
import com.irms.billing.application.service.payment.CashPaymentProcessor;
import com.irms.billing.application.service.payment.PaymentProcessorFactory;
import com.irms.audit.application.service.IAuditLogService;
import com.irms.billing.domain.entity.Bill;
import com.irms.billing.domain.entity.BillStatus;
import com.irms.billing.domain.entity.Payment;
import com.irms.billing.domain.entity.PaymentMethod;
import com.irms.billing.domain.entity.PaymentStatus;
import com.irms.billing.domain.repository.BillRepository;
import com.irms.billing.domain.service.BillCalculator;
import com.irms.billing.domain.service.BillNumberGenerator;
import com.irms.billing.domain.service.PaymentStatusCalculator;
import com.irms.common.exception.BusinessException;
import com.irms.order.domain.entity.Order;
import com.irms.order.domain.entity.OrderStatus;
import com.irms.order.domain.entity.OrderType;
import com.irms.order.domain.repository.OrderRepository;
import com.irms.order.domain.service.OrderStatusTransitionValidator;
import com.irms.table.domain.entity.Table;
import com.irms.table.domain.entity.TableStatus;
import com.irms.table.domain.repository.TableRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BillingServiceImplTest {

    @Mock
    private BillRepository billRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private TableRepository tableRepository;

        @Mock
        private IAuditLogService auditLogService;

    private BillingServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new BillingServiceImpl(
                billRepository,
                orderRepository,
                tableRepository,
                new PaymentProcessorFactory(List.of(new CashPaymentProcessor())),
                new BillCalculator(),
                new BillNumberGenerator(),
                new PaymentStatusCalculator(),
                new OrderStatusTransitionValidator(),
                auditLogService
        );

        ReflectionTestUtils.setField(service, "taxRate", new BigDecimal("0.10"));
        ReflectionTestUtils.setField(service, "serviceChargeRate", new BigDecimal("0.05"));
    }

    @Test
    void createBillShouldCalculateTotalsForServedOrder() {
        Order order = Order.builder()
                .id(1L)
                .orderNumber("ORD-20260101-12345")
                .orderType(OrderType.DINE_IN)
                .status(OrderStatus.SERVED)
                .totalAmount(new BigDecimal("100.00"))
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(billRepository.findByOrderId(1L)).thenReturn(Optional.empty());
        when(billRepository.save(any(Bill.class))).thenAnswer(invocation -> {
            Bill bill = invocation.getArgument(0);
            bill.setId(55L);
            return bill;
        });

        Bill bill = service.createBill(CreateBillRequest.builder()
                .orderId(1L)
                .discount(new BigDecimal("10.00"))
                .build());

        assertEquals(55L, bill.getId());
        assertEquals(new BigDecimal("100.00"), bill.getSubtotal());
        assertEquals(new BigDecimal("10.0000"), bill.getTax());
        assertEquals(new BigDecimal("5.0000"), bill.getServiceCharge());
        assertEquals(new BigDecimal("10.00"), bill.getDiscount());
        assertEquals(new BigDecimal("105.0000"), bill.getTotalAmount());
        assertEquals(BillStatus.PENDING, bill.getStatus());
        verify(billRepository).save(any(Bill.class));
    }

    @Test
    void createBillShouldRejectOrdersThatAreNotReadyOrServed() {
        Order order = Order.builder()
                .id(1L)
                .orderNumber("ORD-20260101-12345")
                .orderType(OrderType.DINE_IN)
                .status(OrderStatus.PREPARING)
                .totalAmount(new BigDecimal("100.00"))
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        BusinessException exception = assertThrows(BusinessException.class,
                () -> service.createBill(CreateBillRequest.builder().orderId(1L).build()));

        assertTrue(exception.getMessage().contains("Can only create bill"));
    }

    @Test
    void processPaymentShouldCompleteBillAndReleaseTableForCashPayment() {
        Bill bill = Bill.builder()
                .id(10L)
                .billNumber("BILL-20260101-12345")
                .orderId(1L)
                .subtotal(new BigDecimal("100.00"))
                .tax(new BigDecimal("10.00"))
                .discount(BigDecimal.ZERO)
                .serviceCharge(new BigDecimal("5.00"))
                .totalAmount(new BigDecimal("115.00"))
                .status(BillStatus.PENDING)
                .payments(new ArrayList<>())
                .build();

        Order order = Order.builder()
                .id(1L)
                .orderNumber("ORD-20260101-12345")
                .tableId(99L)
                .status(OrderStatus.SERVED)
                .orderType(OrderType.DINE_IN)
                .build();

        Table table = Table.builder()
                .id(99L)
                .tableNumber("T99")
                .capacity(4)
                .status(TableStatus.OCCUPIED)
                .build();

        when(billRepository.findById(10L)).thenReturn(Optional.of(bill));
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(tableRepository.findById(99L)).thenReturn(Optional.of(table));
        when(billRepository.save(any(Bill.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProcessPaymentRequest request = ProcessPaymentRequest.builder()
                .billId(10L)
                .amount(new BigDecimal("120.00"))
                .paymentMethod(PaymentMethod.CASH)
                .tipAmount(new BigDecimal("5.00"))
                .notes("Paid in cash")
                .build();

        Payment payment = service.processPayment(request);

        assertEquals(PaymentStatus.COMPLETED, payment.getStatus());
        assertEquals(BillStatus.PAID, bill.getStatus());
        assertEquals(new BigDecimal("5.00"), bill.getTipAmount());
        assertEquals(new BigDecimal("120.00"), bill.getTotalAmount());
        assertNotNull(bill.getPaidAt());
        assertEquals(OrderStatus.COMPLETED, order.getStatus());
        assertEquals(TableStatus.AVAILABLE, table.getStatus());
        assertEquals(1, bill.getPayments().size());
        verify(billRepository).save(bill);
    }

    @Test
    void processPaymentShouldAllowPartialPaymentAndKeepOrderOpen() {
        Bill bill = Bill.builder()
                .id(10L)
                .billNumber("BILL-10")
                .orderId(1L)
                .subtotal(new BigDecimal("100.00"))
                .tax(new BigDecimal("10.00"))
                .discount(BigDecimal.ZERO)
                .serviceCharge(BigDecimal.ZERO)
                .totalAmount(new BigDecimal("110.00"))
                .status(BillStatus.PENDING)
                .payments(new ArrayList<>())
                .build();

        when(billRepository.findById(10L)).thenReturn(Optional.of(bill));
        when(billRepository.save(any(Bill.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProcessPaymentRequest request = ProcessPaymentRequest.builder()
                .billId(10L)
                .amount(new BigDecimal("50.00"))
                .paymentMethod(PaymentMethod.CASH)
                .build();

        Payment payment = service.processPayment(request);

        assertEquals(PaymentStatus.COMPLETED, payment.getStatus());
        assertEquals(BillStatus.PARTIALLY_PAID, bill.getStatus());
    }

    @Test
    void processPaymentShouldRejectAmountGreaterThanRemainingDue() {
        Bill bill = Bill.builder()
                .id(10L)
                .billNumber("BILL-10")
                .orderId(1L)
                .totalAmount(new BigDecimal("100.00"))
                .payments(new ArrayList<>())
                .build();

        bill.getPayments().add(Payment.builder()
                .amount(new BigDecimal("40.00"))
                .paymentMethod(PaymentMethod.CASH)
                .status(PaymentStatus.COMPLETED)
                .build());

        when(billRepository.findById(10L)).thenReturn(Optional.of(bill));

        ProcessPaymentRequest request = ProcessPaymentRequest.builder()
                .billId(10L)
                .amount(new BigDecimal("70.00"))
                .paymentMethod(PaymentMethod.CASH)
                .build();

        BusinessException exception = assertThrows(BusinessException.class, () -> service.processPayment(request));

        assertTrue(exception.getMessage().contains("exceeds remaining due"));
    }
}