package com.irms.billing.presentation.controller;

import com.irms.billing.application.dto.BillResponse;
import com.irms.billing.application.dto.CreateBillRequest;
import com.irms.billing.application.dto.PaymentResponse;
import com.irms.billing.application.dto.ProcessPaymentRequest;
import com.irms.billing.application.mapper.BillMapper;
import com.irms.billing.application.mapper.PaymentMapper;
import com.irms.billing.application.service.IBillingService;
import com.irms.billing.domain.entity.Bill;
import com.irms.billing.domain.entity.Payment;
import com.irms.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.nio.charset.StandardCharsets;

/**
 * Bill Controller (SRP, DIP)
 * Handles billing and payment operations
 * Delegates to service layer and uses mappers
 */
@RestController
@RequestMapping("/api/bills")
@RequiredArgsConstructor
@Tag(name = "Bills", description = "Billing and payment APIs")
public class BillController {

    private final IBillingService billingService; // Depend on interface (DIP)
    private final BillMapper billMapper; // Separated mapping (SRP)
    private final PaymentMapper paymentMapper;

    @GetMapping
    @PreAuthorize("hasAnyRole('SERVER', 'CASHIER', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Get all bills")
    public ResponseEntity<ApiResponse<List<BillResponse>>> getAllBills() {
        List<BillResponse> bills = billingService.getAllBills().stream()
                .map(billMapper::toResponse)
                .collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(bills));
    }

    @GetMapping("/{billId}")
    @PreAuthorize("hasAnyRole('SERVER', 'CASHIER', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Get bill by ID")
    public ResponseEntity<ApiResponse<BillResponse>> getBillById(@PathVariable Long billId) {
        Bill bill = billingService.getBillById(billId);
        return ResponseEntity.ok(ApiResponse.success(billMapper.toResponse(bill)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('CASHIER', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Generate bill from order")
    public ResponseEntity<ApiResponse<BillResponse>> createBill(@Valid @RequestBody CreateBillRequest request) {
        Bill bill = billingService.createBill(request);
        BillResponse response = billMapper.toResponse(bill);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Bill created successfully"));
    }

    @PostMapping("/order/{orderId}")
    @PreAuthorize("hasAnyRole('CASHIER', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Generate bill from order")
    public ResponseEntity<ApiResponse<BillResponse>> createBill(
            @PathVariable Long orderId,
            @Valid @RequestBody(required = false) CreateBillRequest request) {

        // If no request body, create default request
        if (request == null) {
            request = new CreateBillRequest();
            request.setOrderId(orderId);
        } else {
            request.setOrderId(orderId);
        }

        Bill bill = billingService.createBill(request);
        BillResponse response = billMapper.toResponse(bill);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Bill created successfully"));
    }

    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasAnyRole('SERVER', 'CASHIER', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Get bill by order ID")
    public ResponseEntity<ApiResponse<BillResponse>> getBillByOrderId(@PathVariable Long orderId) {
        Bill bill = billingService.getBillByOrderId(orderId);
        BillResponse response = billMapper.toResponse(bill);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/payments")
    @PreAuthorize("hasAnyRole('CASHIER', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Process payment for bill")
    public ResponseEntity<ApiResponse<BillResponse>> processPayment(
            @Valid @RequestBody ProcessPaymentRequest request) {

        Payment payment = billingService.processPayment(request);
        BillResponse response = billMapper.toResponse(billingService.getBillById(request.getBillId()));

        String message = payment.getStatus().name().equals("COMPLETED")
                ? "Payment processed successfully"
                : "Payment processing failed";

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, message));
    }

    @PostMapping("/{billId}/payments")
    @PreAuthorize("hasAnyRole('CASHIER', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Process payment for bill by ID")
    public ResponseEntity<ApiResponse<BillResponse>> processPaymentByBillId(
            @PathVariable Long billId,
            @Valid @RequestBody ProcessPaymentRequest request) {

        request.setBillId(billId);
        Payment payment = billingService.processPayment(request);
        BillResponse response = billMapper.toResponse(billingService.getBillById(billId));

        String message = payment.getStatus().name().equals("COMPLETED")
                ? "Payment processed successfully"
                : "Payment processing failed";

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, message));
    }

    @GetMapping("/{billId}/receipt")
    @PreAuthorize("hasAnyRole('CASHIER', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Download receipt as text file")
    public ResponseEntity<byte[]> downloadReceipt(@PathVariable Long billId) {
        String receipt = billingService.generateReceiptText(billId);
        String filename = "receipt-" + billId + ".txt";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.TEXT_PLAIN)
                .body(receipt.getBytes(StandardCharsets.UTF_8));
    }
}
