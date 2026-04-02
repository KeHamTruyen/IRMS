package com.irms.order.application.event.handler;

import com.irms.common.event.EventHandler;
import com.irms.kitchen.domain.entity.KitchenOrder;
import com.irms.kitchen.domain.entity.KitchenOrderStatus;
import com.irms.kitchen.domain.repository.KitchenOrderRepository;
import com.irms.order.domain.entity.Order;
import com.irms.order.domain.entity.OrderItem;
import com.irms.order.domain.event.OrderPlacedEvent;
import com.irms.order.domain.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * OCP: New handler added without modifying existing code
 * 
 * Notifies kitchen when order is placed
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OrderPlacedKitchenNotificationHandler implements EventHandler<OrderPlacedEvent> {
    
    private final OrderRepository orderRepository;
    private final KitchenOrderRepository kitchenOrderRepository;
    
    @Value("${app.event-handlers.order-placed-kitchen-notification.enabled:true}")
    private boolean enabled;
    
    @Override
    public void handle(OrderPlacedEvent event) {
        Order order = orderRepository.findById(event.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found: " + event.getOrderId()));

        // Create one kitchen task per order item so stations can process in parallel.
        for (OrderItem item : order.getItems()) {
            KitchenOrder kitchenOrder = KitchenOrder.builder()
                .orderId(order.getId())
                .orderItemId(item.getId())
                .menuItemId(item.getMenuItemId())
                .itemName(item.getMenuItemName() != null ? item.getMenuItemName() : "Item-" + item.getMenuItemId())
                .quantity(item.getQuantity())
                .specialInstructions(item.getSpecialInstructions())
                .status(KitchenOrderStatus.PENDING)
                .priority(1)
                .build();

            kitchenOrderRepository.save(kitchenOrder);
        }
        
        log.info("🍳 KITCHEN NOTIFIED: Kitchen order created for order #{}", 
                event.getOrderNumber());
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
        return 10;  // Medium priority - after logging
    }
    
    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
