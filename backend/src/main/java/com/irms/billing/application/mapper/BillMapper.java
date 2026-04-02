package com.irms.billing.application.mapper;

import com.irms.billing.application.dto.BillResponse;
import com.irms.billing.domain.entity.Bill;
import org.springframework.stereotype.Component;

/**
 * Bill mapper - separates mapping logic (SRP)
 */
@Component
public class BillMapper {
    
    /**
     * Map Bill entity to BillResponse DTO
     */
    public BillResponse toResponse(Bill bill) {
        return BillResponse.builder()
                .id(bill.getId())
                .billNumber(bill.getBillNumber())
                .orderId(bill.getOrderId())
                .subtotal(bill.getSubtotal())
                .tax(bill.getTax())
                .discount(bill.getDiscount())
                .serviceCharge(bill.getServiceCharge())
                .totalAmount(bill.getTotalAmount())
                .status(bill.getStatus())
                .createdAt(bill.getCreatedAt())
                .paidAt(bill.getPaidAt())
                .build();
    }
}
