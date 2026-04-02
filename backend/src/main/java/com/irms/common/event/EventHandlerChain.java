package com.irms.common.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.Comparator;
import java.util.List;

/**
 * Chain of Responsibility for event handling
 * 
 * OCP: New handlers can be added without modifying this chain
 * Handlers are automatically discovered and registered by Spring
 */
@Slf4j
@RequiredArgsConstructor
public class EventHandlerChain<T> {
    
    private final List<EventHandler<T>> handlers;
    
    /**
     * Execute handler chain for the given event
     * 
     * All enabled handlers that can handle the event will be invoked
     * Handlers are executed in priority order (lower priority value = executed first)
     * 
     * @param event Event to process
     */
    public void execute(T event) {
        if (event == null) {
            log.warn("Null event received, skipping handler chain");
            return;
        }
        
        log.debug("Executing handler chain for event: {}", event.getClass().getSimpleName());
        
        // Get enabled handlers that can handle this event, sorted by priority
        List<EventHandler<T>> applicableHandlers = handlers.stream()
                .filter(EventHandler::isEnabled)
                .filter(handler -> handler.canHandle(event))
                .sorted(Comparator.comparingInt(EventHandler::getPriority))
                .toList();
        
        if (applicableHandlers.isEmpty()) {
            log.warn("No handlers found for event: {}", event.getClass().getSimpleName());
            return;
        }
        
        log.debug("Found {} applicable handlers", applicableHandlers.size());
        
        // Execute each handler
        for (EventHandler<T> handler : applicableHandlers) {
            try {
                log.debug("Executing handler: {}", handler.getHandlerName());
                handler.handle(event);
            } catch (Exception e) {
                log.error("Error in handler {}: {}", handler.getHandlerName(), e.getMessage(), e);
                // Continue with next handler (don't break the chain)
            }
        }
        
        log.debug("Handler chain execution completed");
    }
    
    /**
     * Get all handlers in the chain
     * 
     * @return List of handlers
     */
    public List<EventHandler<T>> getHandlers() {
        return List.copyOf(handlers);
    }
}
