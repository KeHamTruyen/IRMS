package com.irms.order.application.service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.irms.order.application.dto.CreateOrderRequest;
import com.irms.order.domain.entity.Order;
import com.irms.order.domain.entity.OrderItem;
import com.irms.order.domain.entity.OrderStatus;
// Chú ý: Đổi IOrderRepository thành OrderRepository nếu file thực tế không có chữ I
import com.irms.order.domain.repository.OrderRepository; 
import com.irms.order.domain.service.OrderCalculator;
import com.irms.order.domain.service.OrderNumberGenerator;
import com.irms.order.domain.service.OrderValidator;
import com.irms.order.domain.event.OrderPlacedEvent;
import java.math.BigDecimal;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class OrderService implements IOrderService {

    private final OrderRepository orderRepository;
    private final OrderValidator orderValidator;
    private final OrderCalculator orderCalculator;
    private final OrderNumberGenerator orderNumberGenerator;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public Order createOrder(CreateOrderRequest request) {
        // 1. Chuyển đổi từ Request sang Entity Order
        Order order = Order.builder()
                .tableId(request.getTableId())
                .serverId(request.getServerId())
                .status(OrderStatus.PENDING)
                .orderType(request.getOrderType())
                .notes(request.getNotes())
                .build();

        // Set orderNumber
        order.setOrderNumber(orderNumberGenerator.generate());

        // Map items
        List<OrderItem> orderItems = request.getItems().stream()
                .map(item -> OrderItem.builder()
                        .menuItemId(item.getMenuItemId())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .specialInstructions(item.getSpecialInstructions())
                        .build())
                .collect(Collectors.toList());

        orderItems.forEach(item -> item.setOrder(order));
        order.setItems(orderItems);

        // 3. Tính toán tổng tiền
        BigDecimal total = orderCalculator.calculateTotal(order.getItems());
        order.setTotalAmount(total);

        // 2. Kiểm tra tính hợp lệ
        orderValidator.validate(order);

        // 4. Lưu đơn hàng vào cơ sở dữ liệu
        Order savedOrder = orderRepository.save(order);
        
        // Publish event
        eventPublisher.publishEvent(OrderPlacedEvent.builder()
                .orderId(savedOrder.getId())
                .orderNumber(savedOrder.getOrderNumber())
                .tableId(savedOrder.getTableId())
                .build());
        
        return savedOrder;
    }

    @Override
    @Transactional
    public Order addItems(Long orderId, List<com.irms.order.application.dto.OrderItemRequest> items, String notes) {
        throw new UnsupportedOperationException("Legacy OrderService is not registered as an application service");
    }

    @Override
    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy đơn hàng với ID: " + id));
    }

    @Override
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Override
    public List<Order> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status);
    }

    @Override
    @Transactional
    public Order updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = getOrderById(orderId);
        
        // Cập nhật trạng thái mới
        order.setStatus(newStatus);
        
        return orderRepository.save(order);
    }

    @Override
    @Transactional
    public void cancelOrder(Long orderId) {
        Order order = getOrderById(orderId);
        
        // Chuyển trạng thái đơn hàng thành Đã hủy
        order.setStatus(OrderStatus.CANCELLED);
        
        orderRepository.save(order);
    }
}
