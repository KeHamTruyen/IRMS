package com.irms.kitchen.application.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.irms.admin.domain.entity.MenuItem;
import com.irms.admin.domain.entity.User;
import com.irms.admin.domain.repository.MenuItemRepository;
import com.irms.admin.domain.repository.UserRepository;
import com.irms.common.exception.BusinessException;
import com.irms.inventory.application.service.IInventoryDeductionService;
import com.irms.kitchen.application.dto.KitchenDisplayOrderResponse;
import com.irms.kitchen.domain.entity.KitchenOrder;
import com.irms.kitchen.domain.entity.KitchenOrderStatus;
import com.irms.kitchen.domain.repository.KitchenOrderRepository;
import com.irms.kitchen.domain.service.KitchenOrderFactory;
import com.irms.order.domain.entity.ItemStatus;
import com.irms.order.domain.entity.Order;
import com.irms.order.domain.entity.OrderItem;
import com.irms.order.domain.entity.OrderStatus;
import com.irms.order.domain.entity.OrderType;
import com.irms.order.domain.repository.OrderRepository;

@ExtendWith(MockitoExtension.class)
class KitchenServiceImplTest {

    @Mock
    private KitchenOrderRepository kitchenOrderRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private MenuItemRepository menuItemRepository;

    @Mock
    private IInventoryDeductionService inventoryDeductionService;

    private KitchenOrderFactory kitchenOrderFactory;

    private KitchenServiceImpl kitchenService;

    @BeforeEach
    void setUp() {
        kitchenOrderFactory = new KitchenOrderFactory();
        kitchenService = new KitchenServiceImpl(
                kitchenOrderRepository,
                userRepository,
                orderRepository,
                menuItemRepository,
                inventoryDeductionService,
                kitchenOrderFactory);
    }

    @Test
    void receiveNewOrder_createsKitchenItemsOncePerOrderItem() {
        Order order = Order.builder()
                .id(10L)
                .orderNumber("ORD-10")
                .serverId(1L)
                .status(OrderStatus.PENDING)
                .orderType(OrderType.DINE_IN)
                .items(List.of(
                        orderItem(100L, 1L, 2, "No onion"),
                        orderItem(101L, 2L, 1, "Extra hot")
                ))
                .build();

        when(orderRepository.findById(10L)).thenReturn(Optional.of(order));
        when(kitchenOrderRepository.existsByOrderItemId(100L)).thenReturn(false);
        when(kitchenOrderRepository.existsByOrderItemId(101L)).thenReturn(false);
        MenuItem soup = menuItem(1L, "Soup", "Appetizer", 5);
        MenuItem steak = menuItem(2L, "Steak", "Main", 20);
        when(menuItemRepository.findById(1L)).thenReturn(Optional.of(soup));
        when(menuItemRepository.findById(2L)).thenReturn(Optional.of(steak));

        kitchenService.receiveNewOrder(10L);

        ArgumentCaptor<KitchenOrder> captor = ArgumentCaptor.forClass(KitchenOrder.class);
        verify(kitchenOrderRepository, times(2)).save(captor.capture());

        List<KitchenOrder> savedOrders = captor.getAllValues();
        assertEquals("Soup", savedOrders.get(0).getItemName());
        assertEquals(3, savedOrders.get(0).getPriority());
        assertEquals(5, savedOrders.get(0).getEstimatedPrepTime());
        assertEquals(KitchenOrderStatus.PENDING, savedOrders.get(0).getStatus());
        assertEquals("Steak", savedOrders.get(1).getItemName());
        assertEquals(2, savedOrders.get(1).getPriority());
    }

    @Test
    void receiveNewOrder_throwsWhenOrderHasNoItems() {
        Order order = Order.builder()
                .id(11L)
                .orderNumber("ORD-11")
                .serverId(1L)
                .status(OrderStatus.PENDING)
                .orderType(OrderType.DINE_IN)
                .items(List.of())
                .build();

        when(orderRepository.findById(11L)).thenReturn(Optional.of(order));

        assertThrows(BusinessException.class, () -> kitchenService.receiveNewOrder(11L));
        verify(kitchenOrderRepository, never()).save(any());
    }

    @Test
    void receiveNewOrder_isIdempotent_discardsDuplicateOrder() {
        Order order = Order.builder()
                .id(50L)
                .orderNumber("ORD-50")
                .serverId(1L)
                .status(OrderStatus.PENDING)
                .orderType(OrderType.DINE_IN)
                .items(List.of(
                        orderItem(500L, 1L, 1, null)
                ))
                .build();

        KitchenOrder existingKitchenOrder = KitchenOrder.builder()
                .id(1L)
                .orderId(50L)
                .orderItemId(500L)
                .menuItemId(1L)
                .itemName("Soup")
                .quantity(1)
                .status(KitchenOrderStatus.PENDING)
                .build();

        when(orderRepository.findById(50L)).thenReturn(Optional.of(order));
        when(kitchenOrderRepository.existsByOrderItemId(500L)).thenReturn(true);

        kitchenService.receiveNewOrder(50L);

        verify(kitchenOrderRepository, never()).save(any());
    }

    @Test
    void startPreparation_transitionsFromPendingToPreparing() {
        KitchenOrder pendingOrder = KitchenOrder.builder()
                .id(100L)
                .orderId(20L)
                .orderItemId(200L)
                .menuItemId(5L)
                .itemName("Steak")
                .quantity(1)
                .status(KitchenOrderStatus.PENDING)
                .priority(2)
                .receivedAt(LocalDateTime.now())
                .build();

        User chef = new User();
        chef.setId(1L);
        chef.setUsername("chef1");
        chef.setFullName("Chef John");

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("chef1", null, List.of())
        );

        when(kitchenOrderRepository.findById(100L)).thenReturn(Optional.of(pendingOrder));
        when(userRepository.findByUsername("chef1")).thenReturn(Optional.of(chef));
        when(kitchenOrderRepository.save(pendingOrder)).thenReturn(pendingOrder);
        Order order = orderWithItem(20L, OrderStatus.PREPARING, orderItem(200L, 5L, 1, null));
        when(orderRepository.findById(20L)).thenReturn(Optional.of(order));

        KitchenOrder result = kitchenService.startPreparation(100L);

        assertEquals(KitchenOrderStatus.IN_PROGRESS, result.getStatus());
        assertEquals(ItemStatus.PREPARING, order.getItems().get(0).getStatus());
        assertEquals(1L, result.getAssignedChefId());
        assertNotNull(result.getStartedAt());
        verify(inventoryDeductionService, times(1)).deductForKitchenOrder(pendingOrder);
        verify(kitchenOrderRepository, times(1)).save(pendingOrder);
    }

    @Test
    void startPreparation_throwsWhenNotPending() {
        KitchenOrder preparingOrder = KitchenOrder.builder()
                .id(101L)
                .orderId(20L)
                .orderItemId(201L)
                .menuItemId(5L)
                .itemName("Steak")
                .quantity(1)
                .status(KitchenOrderStatus.IN_PROGRESS)
                .priority(2)
                .receivedAt(LocalDateTime.now())
                .build();

        when(kitchenOrderRepository.findById(101L)).thenReturn(Optional.of(preparingOrder));

        assertThrows(BusinessException.class, () -> kitchenService.startPreparation(101L));
        verify(kitchenOrderRepository, never()).save(any());
    }

    @Test
    void markAsReady_transitionsFromPreparingToReady() {
        KitchenOrder preparingOrder = KitchenOrder.builder()
                .id(200L)
                .orderId(30L)
                .orderItemId(300L)
                .menuItemId(5L)
                .itemName("Steak")
                .quantity(1)
                .status(KitchenOrderStatus.IN_PROGRESS)
                .priority(2)
                .receivedAt(LocalDateTime.now())
                .startedAt(LocalDateTime.now().minusMinutes(15))
                .build();

        when(kitchenOrderRepository.findById(200L)).thenReturn(Optional.of(preparingOrder));
        when(kitchenOrderRepository.save(preparingOrder)).thenReturn(preparingOrder);
        Order order = orderWithItem(30L, OrderStatus.PREPARING, orderItem(300L, 5L, 1, null));
        when(orderRepository.findById(30L)).thenReturn(Optional.of(order));

        KitchenOrder result = kitchenService.markAsReady(200L);

        assertEquals(KitchenOrderStatus.READY, result.getStatus());
        assertEquals(ItemStatus.READY, order.getItems().get(0).getStatus());
        assertEquals(OrderStatus.READY, order.getStatus());
        assertNotNull(result.getCompletedAt());
        verify(kitchenOrderRepository, times(1)).save(preparingOrder);
    }

    @Test
    void markAsReady_throwsWhenNotPreparing() {
        KitchenOrder pendingOrder = KitchenOrder.builder()
                .id(201L)
                .orderId(30L)
                .orderItemId(301L)
                .menuItemId(5L)
                .itemName("Steak")
                .quantity(1)
                .status(KitchenOrderStatus.PENDING)
                .priority(2)
                .receivedAt(LocalDateTime.now())
                .build();

        when(kitchenOrderRepository.findById(201L)).thenReturn(Optional.of(pendingOrder));

        assertThrows(BusinessException.class, () -> kitchenService.markAsReady(201L));
        verify(kitchenOrderRepository, never()).save(any());
    }

    @Test
    void getKitchenDisplayOrders_sortsByCategoryThenPriorityThenReceivedTime() {
        KitchenOrder mainCourse = KitchenOrder.builder()
                .id(2L)
                .orderId(20L)
                .orderItemId(200L)
                .menuItemId(2L)
                .itemName("Burger")
                .quantity(1)
                .status(KitchenOrderStatus.PENDING)
                .priority(2)
                .receivedAt(LocalDateTime.of(2026, 4, 13, 10, 5))
                .build();

        KitchenOrder appetizer = KitchenOrder.builder()
                .id(1L)
                .orderId(20L)
                .orderItemId(199L)
                .menuItemId(1L)
                .itemName("Salad")
                .quantity(1)
                .status(KitchenOrderStatus.PENDING)
                .priority(3)
                .receivedAt(LocalDateTime.of(2026, 4, 13, 10, 10))
                .build();

        KitchenOrder dessert = KitchenOrder.builder()
                .id(3L)
                .orderId(21L)
                .orderItemId(201L)
                .menuItemId(3L)
                .itemName("Ice Cream")
                .quantity(1)
                .status(KitchenOrderStatus.PENDING)
                .priority(1)
                .receivedAt(LocalDateTime.of(2026, 4, 13, 10, 15))
                .build();

        KitchenOrder beverage = KitchenOrder.builder()
                .id(4L)
                .orderId(21L)
                .orderItemId(202L)
                .menuItemId(4L)
                .itemName("Cola")
                .quantity(2)
                .status(KitchenOrderStatus.PENDING)
                .priority(1)
                .receivedAt(LocalDateTime.of(2026, 4, 13, 10, 12))
                .build();

        KitchenOrder mainCourseHighPriority = KitchenOrder.builder()
                .id(5L)
                .orderId(22L)
                .orderItemId(203L)
                .menuItemId(5L)
                .itemName("Steak")
                .quantity(1)
                .status(KitchenOrderStatus.PENDING)
                .priority(3)
                .receivedAt(LocalDateTime.of(2026, 4, 13, 10, 20))
                .build();

        KitchenOrder appetizerLowPriority = KitchenOrder.builder()
                .id(6L)
                .orderId(23L)
                .orderItemId(204L)
                .menuItemId(6L)
                .itemName("Bruschetta")
                .quantity(1)
                .status(KitchenOrderStatus.PENDING)
                .priority(1)
                .receivedAt(LocalDateTime.of(2026, 4, 13, 10, 8))
                .build();

        List<KitchenOrder> allOrders = List.of(mainCourse, appetizer, dessert, beverage, mainCourseHighPriority, appetizerLowPriority);

        when(kitchenOrderRepository.findActiveOrders()).thenReturn(allOrders);
        when(menuItemRepository.findAllById(List.of(2L, 1L, 3L, 4L, 5L, 6L))).thenReturn(List.of(
                menuItem(2L, "Burger", "Main", 15),
                menuItem(1L, "Salad", "Appetizer", 7),
                menuItem(3L, "Ice Cream", "Dessert", 5),
                menuItem(4L, "Cola", "Beverage", 2),
                menuItem(5L, "Steak", "Main", 25),
                menuItem(6L, "Bruschetta", "Appetizer", 10)
        ));

        List<KitchenDisplayOrderResponse> displayOrders = kitchenService.getKitchenDisplayOrders();

        System.out.println("=== SORTED ORDERS ===");
        displayOrders.forEach(order ->
                System.out.println(order.getCategory() + " - " + order.getItemName() +
                " (priority:" + order.getPriority() + ", time:" + order.getReceivedAt() + ")")
        );

        assertEquals(6, displayOrders.size());
        assertEquals("Appetizer", displayOrders.get(0).getCategory());
        assertEquals("Salad", displayOrders.get(0).getItemName());
        assertEquals("Appetizer", displayOrders.get(1).getCategory());
        assertEquals("Bruschetta", displayOrders.get(1).getItemName());
        assertEquals("Beverage", displayOrders.get(2).getCategory());
        assertEquals("Cola", displayOrders.get(2).getItemName());
        assertEquals("Dessert", displayOrders.get(3).getCategory());
        assertEquals("Ice Cream", displayOrders.get(3).getItemName());
        assertEquals("Main", displayOrders.get(4).getCategory());
        assertEquals("Steak", displayOrders.get(4).getItemName());
        assertEquals("Main", displayOrders.get(5).getCategory());
        assertEquals("Burger", displayOrders.get(5).getItemName());
    }

    private OrderItem orderItem(Long id, Long menuItemId, Integer quantity, String instructions) {
        return OrderItem.builder()
                .id(id)
                .menuItemId(menuItemId)
                .quantity(quantity)
                .unitPrice(BigDecimal.TEN)
                .subtotal(BigDecimal.TEN.multiply(BigDecimal.valueOf(quantity)))
                .specialInstructions(instructions)
                .build();
    }

    private Order orderWithItem(Long id, OrderStatus status, OrderItem item) {
        Order order = Order.builder()
                .id(id)
                .orderNumber("ORD-" + id)
                .serverId(1L)
                .status(status)
                .orderType(OrderType.DINE_IN)
                .items(new java.util.ArrayList<>())
                .build();
        order.addItem(item);
        return order;
    }

    private MenuItem menuItem(Long id, String name, String category, Integer prepTime) {
        return MenuItem.builder()
                .id(id)
                .name(name)
                .category(category)
                .price(BigDecimal.TEN)
                .preparationTime(prepTime)
                .build();
    }
}
