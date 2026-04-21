package com.irms.kitchen.application.service;

import com.irms.admin.domain.entity.MenuItem;
import com.irms.admin.domain.repository.MenuItemRepository;
import com.irms.admin.domain.entity.User;
import com.irms.admin.domain.repository.UserRepository;
import com.irms.common.exception.BusinessException;
import com.irms.common.exception.ResourceNotFoundException;
import com.irms.kitchen.application.dto.KitchenDisplayOrderResponse;
import com.irms.kitchen.domain.entity.KitchenOrder;
import com.irms.kitchen.domain.entity.KitchenOrderStatus;
import com.irms.kitchen.domain.repository.KitchenOrderRepository;
import com.irms.order.domain.entity.Order;
import com.irms.order.domain.entity.OrderItem;
import com.irms.order.domain.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Kitchen service implementation (SRP, DIP)
 * Implements business rules for kitchen workflow
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class KitchenServiceImpl implements IKitchenService {
    
    private final KitchenOrderRepository kitchenOrderRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final MenuItemRepository menuItemRepository;

@Override
    @Transactional
    public void receiveNewOrder(Long orderId) {
        log.info("Receiving new kitchen order for order: {}", orderId);

        List<KitchenOrder> existingOrders = kitchenOrderRepository.findByOrderId(orderId);
        if (!existingOrders.isEmpty()) {
            log.warn("Duplicate order received for orderId: {}. Order already exists in kitchen. Discarding duplicate.", orderId);
            return;
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        if (order.getItems() == null || order.getItems().isEmpty()) {
            throw new BusinessException("Cannot create kitchen order for an order without items");
        }

        for (OrderItem item : order.getItems()) {
            if (kitchenOrderRepository.existsByOrderItemId(item.getId())) {
                log.warn("Kitchen order already exists for order item: {}", item.getId());
                continue;
            }

            MenuItem menuItem = menuItemRepository.findById(item.getMenuItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("MenuItem", item.getMenuItemId()));

            KitchenOrder kitchenOrder = KitchenOrder.builder()
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

            kitchenOrderRepository.save(kitchenOrder);
        }

        log.info("New order {} received by kitchen display", order.getOrderNumber());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<KitchenOrder> getAllKitchenOrders() {
        return kitchenOrderRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<KitchenDisplayOrderResponse> getKitchenDisplayOrders() {
        List<KitchenOrder> activeOrders = kitchenOrderRepository.findActiveOrders();
        Map<Long, MenuItem> menuItemsById = menuItemRepository.findAllById(
                activeOrders.stream()
                        .map(KitchenOrder::getMenuItemId)
                        .filter(Objects::nonNull)
                        .distinct()
                        .toList()
        ).stream().collect(Collectors.toMap(MenuItem::getId, Function.identity()));

        return activeOrders.stream()
                .map(order -> toDisplayResponse(order, menuItemsById.get(order.getMenuItemId())))
                .sorted(Comparator
                        .comparing((KitchenDisplayOrderResponse response) -> normalizeCategory(response.getCategory()))
                        .thenComparing(KitchenDisplayOrderResponse::getPriority, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(KitchenDisplayOrderResponse::getReceivedAt, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<KitchenOrder> getKitchenOrdersByStatus(KitchenOrderStatus status) {
        return kitchenOrderRepository.findByStatus(status);
    }
    
    @Override
    @Transactional
    public KitchenOrder startPreparation(Long kitchenOrderId) {
        log.info("Starting preparation for kitchen order: {}", kitchenOrderId);
        
        KitchenOrder kitchenOrder = kitchenOrderRepository.findById(kitchenOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("KitchenOrder", kitchenOrderId));
        
        // Business Rule 8: Validate status transition
        if (kitchenOrder.getStatus() != KitchenOrderStatus.PENDING) {
            throw new BusinessException(
                    String.format("Cannot start preparation for order with status: %s", 
                            kitchenOrder.getStatus())
            );
        }
        
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User chef = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        
        kitchenOrder.startPreparation(chef.getId());
        
        KitchenOrder updated = kitchenOrderRepository.save(kitchenOrder);
        log.info("Kitchen order {} started preparation by chef {}", kitchenOrderId, chef.getFullName());
        
        return updated;
    }
    
    @Override
    @Transactional
    public KitchenOrder markAsReady(Long kitchenOrderId) {
        log.info("Marking kitchen order as ready: {}", kitchenOrderId);
        
        KitchenOrder kitchenOrder = kitchenOrderRepository.findById(kitchenOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("KitchenOrder", kitchenOrderId));
        
        // Business Rule 8: Validate status transition IN_PROGRESS -> READY
        if (kitchenOrder.getStatus() != KitchenOrderStatus.IN_PROGRESS) {
            throw new BusinessException(
                String.format("Cannot mark as ready order with status: %s. Must be IN_PROGRESS", 
                            kitchenOrder.getStatus())
            );
        }
        
        kitchenOrder.markAsReady();
        
        KitchenOrder updated = kitchenOrderRepository.save(kitchenOrder);
        log.info("Kitchen order {} marked as READY", kitchenOrderId);
        
        return updated;
    }
    
    @Override
    @Transactional
    public KitchenOrder markAsServed(Long kitchenOrderId) {
        log.info("Marking kitchen order as served: {}", kitchenOrderId);
        
        KitchenOrder kitchenOrder = kitchenOrderRepository.findById(kitchenOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("KitchenOrder", kitchenOrderId));
        
        // Business Rule 8: Validate status transition READY -> SERVED
        if (kitchenOrder.getStatus() != KitchenOrderStatus.READY) {
            throw new BusinessException(
                    String.format("Cannot mark as served order with status: %s. Must be READY", 
                            kitchenOrder.getStatus())
            );
        }
        
        kitchenOrder.setStatus(KitchenOrderStatus.SERVED);
        
        KitchenOrder updated = kitchenOrderRepository.save(kitchenOrder);
        log.info("Kitchen order {} marked as SERVED", kitchenOrderId);
        
        return updated;
    }

    private KitchenDisplayOrderResponse toDisplayResponse(KitchenOrder order, MenuItem menuItem) {
        return KitchenDisplayOrderResponse.builder()
                .id(order.getId())
                .orderId(order.getOrderId())
                .orderItemId(order.getOrderItemId())
                .menuItemId(order.getMenuItemId())
                .category(menuItem != null ? menuItem.getCategory() : "UNCATEGORIZED")
                .itemName(order.getItemName())
                .quantity(order.getQuantity())
                .specialInstructions(order.getSpecialInstructions())
                .status(order.getStatus())
                .priority(order.getPriority())
                .assignedChefId(order.getAssignedChefId())
                .estimatedPrepTime(order.getEstimatedPrepTime())
                .receivedAt(order.getReceivedAt())
                .startedAt(order.getStartedAt())
                .completedAt(order.getCompletedAt())
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

    private String normalizeCategory(String category) {
        if (category == null || category.isBlank()) {
            return "ZZZ";
        }
        return category.trim().toUpperCase();
    }
}
