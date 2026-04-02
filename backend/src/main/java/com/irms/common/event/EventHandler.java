package com.irms.common.event;

/**
 * OCP: Open for extension, closed for modification
 * 
 * Event handler interface using Chain of Responsibility pattern
 * New handlers can be added without modifying existing ones
 * 
 * @param <T> Event type
 */
public interface EventHandler<T> {
    
    /**
     * Handle event
     * 
     * @param event Event to handle
     */
    void handle(T event);
    
    /**
     * Check if this handler can handle the event
     * 
     * @param event Event to check
     * @return true if this handler should process the event
     */
    boolean canHandle(T event);
    
    /**
     * Get handler name for logging
     * 
     * @return Handler name
     */
    String getHandlerName();
    
    /**
     * Get handler priority (lower values = higher priority)
     * 
     * @return Priority value
     */
    default int getPriority() {
        return 100;  // Default priority
    }
    
    /**
     * Check if handler is enabled
     * Can be used to toggle handlers on/off via configuration
     * 
     * @return true if enabled
     */
    default boolean isEnabled() {
        return true;  // Default: enabled
    }
}
