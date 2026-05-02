package com.irms.kitchen.application.service;

import com.irms.admin.domain.entity.MenuItem;
import com.irms.admin.domain.repository.MenuItemRepository;
import com.irms.admin.domain.entity.User;
import com.irms.admin.domain.repository.UserRepository;
import com.irms.common.exception.BusinessException;
import com.irms.common.exception.ResourceNotFoundException;
import com.irms.inventory.application.service.IInventoryDeductionService;
import com.irms.kitchen.application.dto.KitchenDisplayOrderResponse;
import com.irms.kitchen.domain.entity.KitchenOrder;
import com.irms.kitchen.domain.entity.KitchenOrderStatus;
import com.irms.kitchen.domain.repository.KitchenOrderRepository;
import com.irms.kitchen.domain.service.KitchenOrderFactory;
import com.irms.order.domain.entity.Order;
import com.irms.order.domain.entity.OrderItem;
import com.irms.order.domain.entity.ItemStatus;
import com.irms.order.domain.entity.OrderStatus;
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
    private final IInventoryDeductionService inventoryDeductionService;
    private final KitchenOrderFactory kitchenOrderFactory;

    @Override
    @Transactional
    public void receiveNewOrder(Long orderId) {
        log.info("Receiving new kitchen order for order: {}", orderId);

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

            kitchenOrderRepository.save(kitchenOrderFactory.create(order, item, menuItem));
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
        
        inventoryDeductionService.deductForKitchenOrder(kitchenOrder);
        kitchenOrder.startPreparation(chef.getId());
        syncOrderItemStatus(kitchenOrder, ItemStatus.PREPARING);
        
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
        syncOrderItemStatus(kitchenOrder, ItemStatus.READY);
        markOrderReadyIfEveryItemReady(kitchenOrder.getOrderId());
        
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
        
        kitchenOrder.markAsServed();
        syncOrderItemStatus(kitchenOrder, ItemStatus.SERVED);
        markOrderServedIfEveryItemServed(kitchenOrder.getOrderId());
        
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

    private String normalizeCategory(String category) {
        if (category == null || category.isBlank()) {
            return "ZZZ";
        }
        return category.trim().toUpperCase();
    }

    private void syncOrderItemStatus(KitchenOrder kitchenOrder, ItemStatus status) {
        Order order = orderRepository.findById(kitchenOrder.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order", kitchenOrder.getOrderId()));

        order.getItems().stream()
                .filter(item -> item.getId().equals(kitchenOrder.getOrderItemId()))
                .findFirst()
                .ifPresent(item -> item.setStatus(status));

        orderRepository.save(order);
    }

    private void markOrderReadyIfEveryItemReady(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        boolean everyItemReady = order.getItems().stream()
                .allMatch(item -> item.getStatus() == ItemStatus.READY || item.getStatus() == ItemStatus.SERVED);

        if (everyItemReady && order.getStatus() == OrderStatus.PREPARING) {
            order.setStatus(OrderStatus.READY);
            orderRepository.save(order);
        }
    }

    private void markOrderServedIfEveryItemServed(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        boolean everyItemServed = order.getItems().stream()
                .allMatch(item -> item.getStatus() == ItemStatus.SERVED);

        if (everyItemServed && order.getStatus() == OrderStatus.READY) {
            order.setStatus(OrderStatus.SERVED);
            orderRepository.save(order);
        }
    }
}
