package com.irms.order.application.event.handler;

import com.irms.common.event.EventHandler;
import com.irms.kitchen.application.service.IKitchenService;
import com.irms.order.domain.event.OrderPlacedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Compatibility bridge for the custom event-handler abstraction.
 *
 * Kitchen order creation now lives in the kitchen module.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OrderPlacedKitchenNotificationHandler implements EventHandler<OrderPlacedEvent> {

    private final IKitchenService kitchenService;

    @Value("${app.event-handlers.order-placed-kitchen-notification.enabled:true}")
    private boolean enabled;

    @Override
    public void handle(OrderPlacedEvent event) {
        kitchenService.receiveNewOrder(event.getOrderId());
        log.info("Kitchen notified for order #{}", event.getOrderNumber());
    }

    @Override
    public boolean canHandle(OrderPlacedEvent event) {
        return event != null && event.getOrderId() != null;
    }

    @Override
    public String getHandlerName() {
        return "OrderPlacedKitchenNotificationHandler";
    }

    @Override
    public int getPriority() {
        return 10;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
