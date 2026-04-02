package com.irms.order.application.event.handler;

import com.irms.common.event.EventHandler;
import com.irms.order.domain.event.OrderPlacedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * OCP: New handler added without modifying existing code
 * 
 * Logs order placed events
 */
@Slf4j
@Component
public class OrderPlacedLoggingHandler implements EventHandler<OrderPlacedEvent> {
    
    @Value("${app.event-handlers.order-placed-logging.enabled:true}")
    private boolean enabled;
    
    @Override
    public void handle(OrderPlacedEvent event) {
        log.info("📝 ORDER PLACED: Order #{} for table #{}", 
                event.getOrderNumber(), 
                event.getTableId());
    }
    
    @Override
    public boolean canHandle(OrderPlacedEvent event) {
        return event != null;  // Can handle all OrderPlacedEvent
    }
    
    @Override
    public String getHandlerName() {
        return "OrderPlacedLoggingHandler";
    }
    
    @Override
    public int getPriority() {
        return 1;  // High priority - log first
    }
    
    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
