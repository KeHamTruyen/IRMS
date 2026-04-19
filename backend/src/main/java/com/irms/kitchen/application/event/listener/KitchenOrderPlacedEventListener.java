package com.irms.kitchen.application.event.listener;

import com.irms.kitchen.application.service.IKitchenService;
import com.irms.order.domain.event.OrderPlacedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Kitchen-owned listener for new orders coming from service/order placement.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class KitchenOrderPlacedEventListener {

    private final IKitchenService kitchenService;

    @EventListener
    public void handleOrderPlaced(OrderPlacedEvent event) {
        try {
            kitchenService.receiveNewOrder(event.getOrderId());
        } catch (Exception ex) {
            log.error("Failed to receive order {} in kitchen", event.getOrderId(), ex);
        }
    }
}
