package com.irms.billing.application.service;

import com.irms.billing.application.dto.CreateBillRequest;
import com.irms.billing.application.dto.ProcessPaymentRequest;
import com.irms.billing.application.service.payment.PaymentProcessorFactory;
import com.irms.billing.domain.entity.Bill;
import com.irms.billing.domain.entity.BillStatus;
import com.irms.billing.domain.entity.Payment;
import com.irms.billing.domain.entity.PaymentStatus;
import com.irms.billing.domain.repository.BillRepository;
import com.irms.billing.domain.service.BillCalculator;
import com.irms.billing.domain.service.BillNumberGenerator;
import com.irms.billing.domain.service.PaymentStatusCalculator;
import com.irms.billing.domain.service.PaymentProcessor;
import com.irms.common.exception.BusinessException;
import com.irms.common.exception.ResourceNotFoundException;
import com.irms.order.domain.entity.Order;
import com.irms.order.domain.entity.OrderStatus;
import com.irms.order.domain.repository.OrderRepository;
import com.irms.order.domain.service.OrderStatusTransitionValidator;
import com.irms.table.domain.entity.TableStatus;
import com.irms.table.domain.repository.TableRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Billing service implementation - 100% SOLID Compliant
 * 
 * SRP: Uses domain services for business logic
 * OCP: Uses Strategy Pattern for payment processing
 * DIP: Depends on abstractions (interfaces)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BillingServiceImpl implements IBillingService {
    
    private final BillRepository billRepository;
    private final OrderRepository orderRepository;
    private final TableRepository tableRepository;
    private final PaymentProcessorFactory paymentProcessorFactory;
    
    // ✅ SRP: Domain services injected
    private final BillCalculator billCalculator;
    private final BillNumberGenerator billNumberGenerator;
    private final PaymentStatusCalculator paymentStatusCalculator;
    private final OrderStatusTransitionValidator orderStatusTransitionValidator;
    
    @Value("${app.tax-rate}")
    private BigDecimal taxRate;
    
    @Value("${app.service-charge-rate}")
    private BigDecimal serviceChargeRate;
    
    @Override
    @Transactional
    public Bill createBill(CreateBillRequest request) {
        log.info("Creating bill for order: {}", request.getOrderId());
        
        // Business Rule 4: Bill can only be generated from an existing order
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order", request.getOrderId()));
        
        // Check if order can be billed
        if (order.getStatus() != OrderStatus.SERVED && order.getStatus() != OrderStatus.READY) {
            throw new BusinessException("Can only create bill for served or ready orders");
        }
        
        // Check if bill already exists
        if (billRepository.findByOrderId(order.getId()).isPresent()) {
            throw new BusinessException("Bill already exists for this order");
        }
        
        // ✅ SRP: Generate bill number via domain service
        String billNumber = billNumberGenerator.generate();
        
        // ✅ SRP: Calculate bill via domain service
        BillCalculator.BillCalculationInput input = BillCalculator.BillCalculationInput.builder()
                .subtotal(order.getTotalAmount())
                .taxRate(taxRate)
                .serviceChargeRate(serviceChargeRate)
                .discount(request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO)
                .build();
        
        BillCalculator.BillCalculationResult result = billCalculator.calculate(input);
        
        // Create bill
        Bill bill = Bill.builder()
                .billNumber(billNumber)  // ✅ Explicitly set
                .orderId(order.getId())
                .subtotal(result.getSubtotal())
                .tax(result.getTax())
                .serviceCharge(result.getServiceCharge())
                .discount(result.getDiscount())
                .totalAmount(result.getTotalAmount())
                .build();
        
        Bill savedBill = billRepository.save(bill);
        log.info("Bill created: {} with total: {}", savedBill.getBillNumber(), savedBill.getTotalAmount());
        
        return savedBill;
    }
    
    @Override
    @Transactional(readOnly = true)
    public Bill getBillByOrderId(Long orderId) {
        return billRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found for order: " + orderId));
    }
    
    @Override
    @Transactional
    public Payment processPayment(ProcessPaymentRequest request) {
        log.info("Processing payment for bill: {}", request.getBillId());
        
        // Get bill
        Bill bill = billRepository.findById(request.getBillId())
                .orElseThrow(() -> new ResourceNotFoundException("Bill", request.getBillId()));
        
        // Business Rule 5: Payment amount must be equal to or greater than bill total
        if (request.getAmount().compareTo(bill.getTotalAmount()) < 0) {
            throw new BusinessException(
                    String.format("Payment amount %.2f is less than bill total %.2f",
                            request.getAmount(), bill.getTotalAmount())
            );
        }
        
        // Get appropriate payment processor (Strategy Pattern)
        PaymentProcessor processor = paymentProcessorFactory.getProcessor(request.getPaymentMethod());
        
        // Validate payment
        if (!processor.validatePayment(request.getAmount())) {
            throw new BusinessException("Payment validation failed for method: " + request.getPaymentMethod());
        }
        
        // Create payment entity
        Payment payment = Payment.builder()
                .bill(bill)
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod())
                .status(PaymentStatus.PENDING)
                .build();
        
        // Process payment using strategy
        boolean paymentSuccess = processor.processPayment(payment, request.getAmount());
        
        if (paymentSuccess) {
            // Business Rule 6: Successful payment sets bill=PAID, payment=SUCCESS, order=COMPLETED, table=AVAILABLE
            handleSuccessfulPayment(bill, payment);
        } else {
            // Business Rule 7: Failed payment keeps bill UNPAID
            handleFailedPayment(bill, payment);
        }
        
        // Add payment to bill
        bill.addPayment(payment);
        
        // ✅ SRP: Update bill status via domain service
        BillStatus newStatus = paymentStatusCalculator.calculateBillStatus(
                bill.getPayments(), 
                bill.getTotalAmount()
        );
        bill.setStatus(newStatus);
        if (newStatus == BillStatus.PAID) {
            bill.setPaidAt(LocalDateTime.now());
        }
        
        billRepository.save(bill);
        
        return payment;
    }
    
    /**
     * Business Rule 6: Handle successful payment
     */
    private void handleSuccessfulPayment(Bill bill, Payment payment) {
        log.info("Payment successful for bill: {}", bill.getBillNumber());
        
        // Set payment as SUCCESS (already done in processor)
        payment.setStatus(PaymentStatus.COMPLETED);
        
        // Set order as COMPLETED
        Order order = orderRepository.findById(bill.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order", bill.getOrderId()));
        
        // ✅ SRP: Validate status transition via domain service
        orderStatusTransitionValidator.validateTransition(order.getStatus(), OrderStatus.COMPLETED);
        order.setStatus(OrderStatus.COMPLETED);
        orderRepository.save(order);
        
        // Set table as AVAILABLE
        if (order.getTableId() != null) {
            tableRepository.findById(order.getTableId()).ifPresent(table -> {
                table.setStatus(TableStatus.AVAILABLE);
                tableRepository.save(table);
                log.info("Table {} released and set to AVAILABLE", table.getTableNumber());
            });
        }
        
        log.info("Payment workflow completed successfully");
    }
    
    /**
     * Business Rule 7: Handle failed payment
     */
    private void handleFailedPayment(Bill bill, Payment payment) {
        log.warn("Payment failed for bill: {}", bill.getBillNumber());
        
        // Keep bill UNPAID (status unchanged)
        // Payment status already set to FAILED in processor
        payment.setStatus(PaymentStatus.FAILED);
        
        log.info("Bill remains UNPAID, customer can retry payment");
    }
}