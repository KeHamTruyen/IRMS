package com.irms.order.application.service;

import com.irms.order.application.dto.CreateOrderRequest;
import com.irms.order.application.dto.OrderItemRequest;
import com.irms.order.domain.entity.Order;
import com.irms.order.domain.entity.OrderStatus;

import java.util.List;

/**
 * Order service interface (ISP, DIP)
 * Định nghĩa các hành động nghiệp vụ cho module đặt hàng.
 */
public interface IOrderService {
    
    /**
     * Tạo mới một đơn hàng từ yêu cầu của khách hàng
     */
    Order createOrder(CreateOrderRequest request);

    /**
     * Thêm món vào một đơn hàng đang mở trước khi thanh toán.
     */
    Order addItems(Long orderId, List<OrderItemRequest> items, String notes);
    
    /**
     * Tìm kiếm đơn hàng theo mã ID
     */
    Order getOrderById(Long id);
    
    /**
     * Lấy danh sách tất cả các đơn hàng trong hệ thống
     */
    List<Order> getAllOrders();
    
    /**
     * Lọc danh sách đơn hàng theo trạng thái (PENDING, PAID, CANCELLED,...)
     */
    List<Order> getOrdersByStatus(OrderStatus status);
    
    /**
     * Cập nhật trạng thái mới cho đơn hàng
     */
    Order updateOrderStatus(Long orderId, OrderStatus newStatus);
    
    /**
     * Hủy đơn hàng
     */
    void cancelOrder(Long orderId);
}
