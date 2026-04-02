package com.irms.order.application.mapper;

import com.irms.admin.domain.entity.MenuItem;
import com.irms.admin.domain.entity.User;
import com.irms.admin.domain.repository.MenuItemRepository;
import com.irms.admin.domain.repository.UserRepository;
import com.irms.order.application.dto.OrderItemResponse;
import com.irms.order.application.dto.OrderResponse;
import com.irms.order.domain.entity.Order;
import com.irms.order.domain.entity.OrderItem;
import com.irms.table.domain.entity.Table;
import com.irms.table.domain.repository.TableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Order mapper - separates mapping logic from controller (SRP)
 */
@Component
@RequiredArgsConstructor
public class OrderMapper {
    
    private final MenuItemRepository menuItemRepository;
    private final UserRepository userRepository;
    private final TableRepository tableRepository;
    
    /**
     * Map Order entity to OrderResponse DTO
     */
    public OrderResponse toResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(this::toItemResponse)
                .collect(Collectors.toList());
        
        String tableName = null;
        if (order.getTableId() != null) {
            tableName = tableRepository.findById(order.getTableId())
                    .map(Table::getTableNumber)
                    .orElse(null);
        }
        
        String serverName = userRepository.findById(order.getServerId())
                .map(User::getFullName)
                .orElse("Unknown");
        
        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .tableId(order.getTableId())
                .tableName(tableName)
                .serverId(order.getServerId())
                .serverName(serverName)
                .status(order.getStatus())
                .orderType(order.getOrderType())
                .items(itemResponses)
                .totalAmount(order.getTotalAmount())
                .notes(order.getNotes())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
    
    /**
     * Map OrderItem entity to OrderItemResponse DTO
     */
    public OrderItemResponse toItemResponse(OrderItem item) {
        String menuItemName = menuItemRepository.findById(item.getMenuItemId())
                .map(MenuItem::getName)
                .orElse("Unknown Item");
        
        return OrderItemResponse.builder()
                .id(item.getId())
                .menuItemId(item.getMenuItemId())
                .menuItemName(menuItemName)
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .subtotal(item.getSubtotal())
                .specialInstructions(item.getSpecialInstructions())
                .status(item.getStatus())
                .build();
    }
    
    /**
     * Map list of orders to list of responses
     */
    public List<OrderResponse> toResponseList(List<Order> orders) {
        return orders.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
}
