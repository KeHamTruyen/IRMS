package com.irms.billing.application.service;

import com.irms.audit.application.service.IAuditLogService;
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
import java.util.List;

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
    private final IAuditLogService auditLogService;
    
    @Value("${app.tax-rate}")
    private BigDecimal taxRate;
    
    @Value("${app.service-charge-rate}")
    private BigDecimal serviceChargeRate;

    @Override
    @Transactional(readOnly = true)
    public List<Bill> getAllBills() {
        return billRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Bill getBillById(Long billId) {
        return billRepository.findById(billId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill", billId));
    }
    
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
        auditLogService.logAction(
            "BILL_CREATED",
            "BILL",
            savedBill.getId(),
            "orderId=" + savedBill.getOrderId() + ", total=" + savedBill.getTotalAmount()
        );
        
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
        
        // Apply tip before first completed payment so total is fixed for split payments.
        applyTipIfPresent(bill, request.getTipAmount());

        BigDecimal amountPaid = paymentStatusCalculator.calculateTotalPaid(bill.getPayments());
        BigDecimal remainingDue = bill.getTotalAmount().subtract(amountPaid);

        if (remainingDue.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Bill is already fully paid");
        }

        // Split payment rule: each payment must be > 0 and cannot exceed remaining due.
        if (request.getAmount().compareTo(remainingDue) > 0) {
            throw new BusinessException(
                    String.format("Payment amount %.2f exceeds remaining due %.2f",
                            request.getAmount(), remainingDue)
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
            // Successful payment updates payment status. Bill/order state is finalized after status recalculation.
            payment.setStatus(PaymentStatus.COMPLETED);
            payment.setProcessedAt(LocalDateTime.now());
            auditLogService.logAction(
                    "PAYMENT_COMPLETED",
                    "BILL",
                    bill.getId(),
                    "method=" + request.getPaymentMethod() + ", amount=" + request.getAmount()
            );
        } else {
            // Business Rule 7: Failed payment keeps bill UNPAID
            handleFailedPayment(bill, payment);
            auditLogService.logAction(
                    "PAYMENT_FAILED",
                    "BILL",
                    bill.getId(),
                    "method=" + request.getPaymentMethod() + ", amount=" + request.getAmount()
            );
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
            finalizeOrderAndTableWhenBillPaid(bill);
        }
        
        billRepository.save(bill);
        
        return payment;
    }

    @Override
    @Transactional(readOnly = true)
    public String generateReceiptText(Long billId) {
        Bill bill = getBillById(billId);
        BigDecimal amountPaid = paymentStatusCalculator.calculateTotalPaid(bill.getPayments());
        BigDecimal remainingDue = bill.getTotalAmount().subtract(amountPaid).max(BigDecimal.ZERO);

        StringBuilder sb = new StringBuilder();
        sb.append("IRMS RECEIPT\n");
        sb.append("==============================\n");
        sb.append("Bill No: ").append(bill.getBillNumber()).append("\n");
        sb.append("Order ID: ").append(bill.getOrderId()).append("\n");
        sb.append("Created: ").append(bill.getCreatedAt()).append("\n");
        if (bill.getPaidAt() != null) {
            sb.append("Paid At: ").append(bill.getPaidAt()).append("\n");
        }
        sb.append("\n");
        sb.append(String.format("Subtotal:      %.2f\n", bill.getSubtotal()));
        sb.append(String.format("Tax:           %.2f\n", bill.getTax()));
        sb.append(String.format("Service:       %.2f\n", bill.getServiceCharge()));
        sb.append(String.format("Discount:     -%.2f\n", bill.getDiscount()));
        sb.append(String.format("Tip:           %.2f\n", bill.getTipAmount()));
        sb.append(String.format("TOTAL:         %.2f\n", bill.getTotalAmount()));
        sb.append("\n");
        sb.append(String.format("Paid:          %.2f\n", amountPaid));
        sb.append(String.format("Remaining:     %.2f\n", remainingDue));
        sb.append("Status: ").append(bill.getStatus()).append("\n");
        sb.append("\n");
        sb.append("Payments:\n");
        for (Payment payment : bill.getPayments()) {
            sb.append(" - ")
                    .append(payment.getPaymentMethod())
                    .append(" | ")
                    .append(payment.getStatus())
                    .append(" | ")
                    .append(payment.getAmount())
                    .append("\n");
        }
        sb.append("==============================\n");

        return sb.toString();
    }
    
    /**
     * Business Rule 6: Handle successful payment
     */
    private void finalizeOrderAndTableWhenBillPaid(Bill bill) {
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
        
        log.info("Bill {} fully paid. Order and table states finalized", bill.getBillNumber());
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

    private void applyTipIfPresent(Bill bill, BigDecimal tipAmount) {
        if (tipAmount == null || tipAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        if (paymentStatusCalculator.calculateTotalPaid(bill.getPayments()).compareTo(BigDecimal.ZERO) > 0) {
            throw new BusinessException("Cannot change tip after payments have started");
        }

        bill.setTipAmount(tipAmount);
        bill.setTotalAmount(
                billCalculator.recalculateTotal(
                        bill.getSubtotal(),
                        bill.getTax(),
                        bill.getServiceCharge(),
                        bill.getDiscount().subtract(tipAmount)
                )
        );
    }
}