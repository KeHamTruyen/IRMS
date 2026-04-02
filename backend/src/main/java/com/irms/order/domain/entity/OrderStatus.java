package com.irms.order.domain.entity;

public enum OrderStatus {
    PENDING,      // Just created
    CONFIRMED,    // Confirmed by server
    PREPARING,    // Sent to kitchen
    READY,        // Ready to serve
    SERVED,       // Delivered to customer
    COMPLETED,    // Bill paid
    CANCELLED     // Order cancelled
}
