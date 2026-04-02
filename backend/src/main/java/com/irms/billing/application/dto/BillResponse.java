package com.irms.billing.application.dto;

import com.irms.billing.domain.entity.BillStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
    private BigDecimal totalAmount;
    private BillStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
}
