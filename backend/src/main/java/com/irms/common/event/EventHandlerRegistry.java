package com.irms.common.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Registry for event handler chains
 * 
 * OCP: New event types can be registered without modifying this class
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class EventHandlerRegistry {
    
    private final Map<Class<?>, EventHandlerChain<?>> chains = new ConcurrentHashMap<>();
    
    /**
     * Register handlers for an event type
     * 
     * @param eventType Event class type
     * @param handlers List of handlers for this event type
     * @param <T> Event type
     */
    public <T> void registerHandlers(Class<T> eventType, List<EventHandler<T>> handlers) {
        EventHandlerChain<T> chain = new EventHandlerChain<>(handlers);
        chains.put(eventType, chain);
        log.info("Registered {} handlers for event type: {}", handlers.size(), eventType.getSimpleName());
    }
    
    /**
     * Get handler chain for event type
     * 
     * @param eventType Event class type
     * @param <T> Event type
     * @return Handler chain
     */
    @SuppressWarnings("unchecked")
    public <T> EventHandlerChain<T> getChain(Class<T> eventType) {
        EventHandlerChain<T> chain = (EventHandlerChain<T>) chains.get(eventType);
        if (chain == null) {
            log.warn("No handler chain found for event type: {}", eventType.getSimpleName());
            return new EventHandlerChain<>(List.of());  // Empty chain
        }
        return chain;
    }
    
    /**
     * Execute handler chain for event
     * 
     * @param event Event to process
     * @param <T> Event type
     */
    public <T> void execute(T event) {
        if (event == null) {
            log.warn("Cannot execute handlers for null event");
            return;
        }
        
        @SuppressWarnings("unchecked")
        Class<T> eventType = (Class<T>) event.getClass();
        EventHandlerChain<T> chain = getChain(eventType);
        chain.execute(event);
    }
}
