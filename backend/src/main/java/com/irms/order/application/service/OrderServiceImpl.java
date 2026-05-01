package com.irms.order.application.service;

import com.irms.admin.domain.entity.MenuItem;
import com.irms.admin.domain.entity.User;
import com.irms.admin.domain.repository.MenuItemRepository;
import com.irms.admin.domain.repository.UserRepository;
import com.irms.audit.application.service.IAuditLogService;
import com.irms.common.event.DomainEventPublisher;
import com.irms.common.exception.BusinessException;
import com.irms.common.exception.ResourceNotFoundException;
import com.irms.order.application.dto.CreateOrderRequest;
import com.irms.order.application.dto.OrderItemRequest;
import com.irms.order.domain.entity.Order;
import com.irms.order.domain.entity.OrderItem;
import com.irms.order.domain.entity.OrderStatus;
import com.irms.order.domain.entity.OrderType;
import com.irms.order.domain.event.OrderPlacedEvent;
import com.irms.order.domain.repository.OrderRepository;
import com.irms.order.domain.service.OrderCalculator;
import com.irms.order.domain.service.OrderItemCalculator;
import com.irms.order.domain.service.OrderNumberGenerator;
import com.irms.order.domain.service.OrderStatusTransitionValidator;
import com.irms.order.domain.service.OrderValidator;
import com.irms.table.domain.entity.Table;
import com.irms.table.domain.entity.TableStatus;
import com.irms.table.domain.repository.TableRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Order service implementation - 100% SOLID Compliant
 * 
 * SRP: Uses domain services for business logic
 * DIP: Depends on abstractions (interfaces)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements IOrderService {

    private final OrderRepository orderRepository;
    private final MenuItemRepository menuItemRepository;
    private final UserRepository userRepository;
    private final TableRepository tableRepository;
    private final DomainEventPublisher eventPublisher;

    // ✅ SRP: Domain services injected
    private final OrderValidator orderValidator;
    private final OrderCalculator orderCalculator;
    private final OrderItemCalculator orderItemCalculator;
    private final OrderNumberGenerator orderNumberGenerator;
    private final OrderStatusTransitionValidator orderStatusTransitionValidator;
    private final IAuditLogService auditLogService;

    @Override
    @Transactional
    public Order createOrder(CreateOrderRequest request) {
        log.info("Creating order for table: {}", request.getTableId());

        // Business Rule 1: Validate table exists
        Table table = null;
        if (request.getTableId() != null) {
            table = tableRepository.findById(request.getTableId())
                    .orElseThrow(() -> new ResourceNotFoundException("Table", request.getTableId()));
        }

        // Get current user (server)
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User server = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        // ✅ SRP: Generate order number via domain service
        String orderNumber = orderNumberGenerator.generate();

        // Create order
        Order order = Order.builder()
                .orderNumber(orderNumber) // ✅ Explicitly set
                .tableId(request.getTableId())
                .serverId(server.getId())
                .status(OrderStatus.PENDING)
                .orderType(request.getOrderType())
                .notes(request.getNotes())
                .build();

        // Add items
        List<OrderItem> items = createOrderItems(request.getItems());
        items.forEach(order::addItem);

        // ✅ SRP: Calculate total via domain service
        order.setTotalAmount(orderCalculator.calculateTotal(order.getItems()));

        // ✅ SRP: Validate order via domain service
        orderValidator.validate(order);

        // Business Rule 3: Creating order changes table status to OCCUPIED
        if (table != null && request.getOrderType() == OrderType.DINE_IN) {
            table.setStatus(TableStatus.OCCUPIED);
            tableRepository.save(table);
            log.info("Table {} status changed to OCCUPIED", table.getTableNumber());
        }

        // Save order
        Order savedOrder = orderRepository.save(order);
        log.info("Order created: {}", savedOrder.getOrderNumber());
        auditLogService.logAction(
                "ORDER_CREATED",
                "ORDER",
                savedOrder.getId(),
                "status=" + savedOrder.getStatus() + ", tableId=" + savedOrder.getTableId());

        // Publish event
        eventPublisher.publish(OrderPlacedEvent.builder()
                .orderId(savedOrder.getId())
                .orderNumber(savedOrder.getOrderNumber())
                .tableId(savedOrder.getTableId())
                .build());

        return savedOrder;
    }

    @Override
    @Transactional(readOnly = true)
    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status);
    }

    @Override
    @Transactional
    public Order updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = getOrderById(orderId);

        // ✅ SRP: Validate status transition via domain service
        orderStatusTransitionValidator.validateTransition(order.getStatus(), newStatus);

        // Update status
        order.setStatus(newStatus);

        Order updatedOrder = orderRepository.save(order);
        log.info("Order {} status updated to {}", order.getOrderNumber(), newStatus);
        auditLogService.logAction(
                "ORDER_STATUS_UPDATED",
                "ORDER",
                updatedOrder.getId(),
                "newStatus=" + newStatus);

        return updatedOrder;
    }

    @Override
    @Transactional
    public void cancelOrder(Long orderId) {
        Order order = getOrderById(orderId);

        // ✅ SRP: Validate cancellation via domain service
        if (!orderValidator.canBeCancelled(order)) {
            throw new BusinessException("Cannot cancel order with status: " + order.getStatus());
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        // Free up table if dine-in
        if (order.getTableId() != null) {
            tableRepository.findById(order.getTableId()).ifPresent(table -> {
                table.setStatus(TableStatus.AVAILABLE);
                tableRepository.save(table);
                log.info("Table {} status changed to AVAILABLE", table.getTableNumber());
            });
        }

        log.info("Order {} cancelled", order.getOrderNumber());
        auditLogService.logAction(
                "ORDER_CANCELLED",
                "ORDER",
                order.getId(),
                "tableId=" + order.getTableId());
    }

    private List<OrderItem> createOrderItems(List<OrderItemRequest> itemRequests) {
        return itemRequests.stream()
                .map(this::createOrderItem)
                .collect(Collectors.toList());
    }

    private OrderItem createOrderItem(OrderItemRequest request) {
        // Business Rule 2: Cannot add unavailable menu item to order
        MenuItem menuItem = menuItemRepository.findById(request.getMenuItemId())
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", request.getMenuItemId()));

        if (!menuItem.getIsAvailable()) {
            throw new BusinessException("Menu item is not available: " + menuItem.getName());
        }

        OrderItem item = OrderItem.builder()
                .menuItemId(menuItem.getId())
                .quantity(request.getQuantity())
                .unitPrice(menuItem.getPrice())
                .specialInstructions(request.getSpecialInstructions())
                .build();

        item.setMenuItemName(menuItem.getName());
        item.setSubtotal(orderItemCalculator.calculateSubtotal(menuItem.getPrice(), request.getQuantity()));

        return item;
    }
}