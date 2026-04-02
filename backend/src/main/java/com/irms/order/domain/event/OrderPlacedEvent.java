package com.irms.order.domain.event;

import com.irms.common.event.DomainEvent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderPlacedEvent implements DomainEvent {
    
    private Long orderId;
    private String orderNumber;
    private Long tableId;
    
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
