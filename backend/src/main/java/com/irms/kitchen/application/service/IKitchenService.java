package com.irms.kitchen.application.service;

import com.irms.kitchen.application.dto.KitchenDisplayOrderResponse;
import com.irms.kitchen.domain.entity.KitchenOrder;
import com.irms.kitchen.domain.entity.KitchenOrderStatus;

import java.util.List;

/**
 * Kitchen service interface (ISP, DIP)
 * Focused interface for kitchen operations
 */
public interface IKitchenService {

    /**
     * Receive a newly placed order from service and create kitchen work items.
     */
    void receiveNewOrder(Long orderId);
    
    /**
     * Get all kitchen orders
     */
    List<KitchenOrder> getAllKitchenOrders();

    /**
     * Get kitchen orders for kitchen display, sorted by category and queue priority.
     */
    List<KitchenDisplayOrderResponse> getKitchenDisplayOrders();
    
    /**
     * Get kitchen orders by status
     */
    List<KitchenOrder> getKitchenOrdersByStatus(KitchenOrderStatus status);
    
    /**
     * Start preparation for kitchen order
     */
    KitchenOrder startPreparation(Long kitchenOrderId);
    
    /**
     * Mark kitchen order as ready
     */
    KitchenOrder markAsReady(Long kitchenOrderId);
    
    /**
     * Mark kitchen order as served
     */
    KitchenOrder markAsServed(Long kitchenOrderId);
}
