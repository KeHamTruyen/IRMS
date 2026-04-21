package com.irms.order.domain.event;

import com.irms.common.event.DomainEvent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderPlacedEvent implements DomainEvent {
    
    private Long orderId;
    private String orderNumber;
    private Long tableId;
    
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
    
    // Constructor for convenience
    public OrderPlacedEvent(Object source, com.irms.order.domain.entity.Order order) {
        this.orderId = order.getId();
        this.orderNumber = order.getOrderNumber();
        this.tableId = order.getTableId();
        this.timestamp = LocalDateTime.now();
    }
}
