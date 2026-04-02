package com.irms.notification.application.eventhandler;

import com.irms.notification.application.service.WebSocketNotificationService;
import com.irms.order.domain.event.OrderPlacedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventHandler {
    
    private final WebSocketNotificationService notificationService;
    
    @Async
    @EventListener
    public void handleOrderPlaced(OrderPlacedEvent event) {
        log.info("Handling OrderPlacedEvent for order: {}", event.getOrderNumber());
        notificationService.notifyNewOrder(event.getOrderId(), event.getOrderNumber());
    }
}
