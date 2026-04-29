package com.irms.billing.application.dto;

import com.irms.billing.domain.entity.BillStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillResponse {
    private Long id;
    private String billNumber;
    private Long orderId;
    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal discount;
    private BigDecimal serviceCharge;
    private BigDecimal tipAmount;
    private BigDecimal totalAmount;
    private BigDecimal amountPaid;
    private BigDecimal remainingDue;
    private BillStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
    private List<PaymentResponse> payments;
}
