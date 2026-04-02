package com.irms.order.application.event.handler;

import com.irms.common.event.EventHandler;
import com.irms.order.domain.event.OrderPlacedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * OCP: New handler added without modifying existing code
 * 
 * Sends WebSocket notification when order is placed
 */
@Slf4j
@Component
public class OrderPlacedWebSocketHandler implements EventHandler<OrderPlacedEvent> {
    
    @Value("${app.event-handlers.order-placed-websocket.enabled:true}")
    private boolean enabled;
    
    @Override
    public void handle(OrderPlacedEvent event) {
        // In production, this would use SimpMessagingTemplate
        log.info("🔔 WEBSOCKET: Broadcasting order placed event for order #{}", 
                event.getOrderNumber());
        
        // Example: messagingTemplate.convertAndSend("/topic/orders", event);
    }
    
    @Override
    public boolean canHandle(OrderPlacedEvent event) {
        return event != null;
    }
    
    @Override
    public String getHandlerName() {
        return "OrderPlacedWebSocketHandler";
    }
    
    @Override
    public int getPriority() {
        return 20;  // Low priority - after business logic
    }
    
    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
