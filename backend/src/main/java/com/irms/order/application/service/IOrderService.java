package com.irms.order.application.service;

import com.irms.order.application.dto.CreateOrderRequest;
import com.irms.order.domain.entity.Order;
import com.irms.order.domain.entity.OrderStatus;

import java.util.List;

/**
 * Order service interface (ISP, DIP)
 * Focused interface for order operations
 */
public interface IOrderService {
    
    /**
     * Create a new order
     */
    Order createOrder(CreateOrderRequest request);
    
    /**
     * Get order by ID
     */
    Order getOrderById(Long id);
    
    /**
     * Get all orders
     */
    List<Order> getAllOrders();
    
    /**
     * Get orders by status
     */
    List<Order> getOrdersByStatus(OrderStatus status);
    
    /**
     * Update order status
     */
    Order updateOrderStatus(Long orderId, OrderStatus newStatus);
    
    /**
     * Cancel order
     */
    void cancelOrder(Long orderId);
}
