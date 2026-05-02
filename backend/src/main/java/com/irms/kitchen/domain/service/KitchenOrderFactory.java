package com.irms.kitchen.domain.service;

import com.irms.admin.domain.entity.MenuItem;
import com.irms.kitchen.domain.entity.KitchenOrder;
import com.irms.kitchen.domain.entity.KitchenOrderStatus;
import com.irms.order.domain.entity.Order;
import com.irms.order.domain.entity.OrderItem;
import org.springframework.stereotype.Component;

@Component
public class KitchenOrderFactory {

    public KitchenOrder create(Order order, OrderItem item, MenuItem menuItem) {
        return KitchenOrder.builder()
                .orderId(order.getId())
                .orderItemId(item.getId())
                .menuItemId(item.getMenuItemId())
                .itemName(menuItem.getName())
                .quantity(item.getQuantity())
                .specialInstructions(item.getSpecialInstructions())
                .status(KitchenOrderStatus.PENDING)
                .priority(resolvePriority(menuItem.getCategory()))
                .estimatedPrepTime(menuItem.getPreparationTime())
                .build();
    }

    private int resolvePriority(String category) {
        if (category == null || category.isBlank()) {
            return 1;
        }

        return switch (category.trim().toUpperCase()) {
            case "APPETIZER", "STARTER" -> 3;
            case "MAIN", "MAIN COURSE" -> 2;
            case "DESSERT", "BEVERAGE" -> 1;
            default -> 2;
        };
    }
}
