package com.irms.order.application.service;

import com.irms.admin.domain.entity.MenuItem;
import com.irms.admin.domain.entity.User;
import com.irms.admin.domain.repository.MenuItemRepository;
import com.irms.admin.domain.repository.UserRepository;
import com.irms.audit.application.service.IAuditLogService;
import com.irms.billing.domain.repository.BillRepository;
import com.irms.common.event.DomainEventPublisher;
import com.irms.order.application.dto.CreateOrderRequest;
import com.irms.order.application.dto.OrderItemRequest;
import com.irms.order.domain.entity.Order;
import com.irms.order.domain.entity.OrderItem;
import com.irms.order.domain.entity.OrderStatus;
import com.irms.order.domain.entity.OrderType;
import com.irms.order.domain.event.OrderPlacedEvent;
import com.irms.order.domain.repository.OrderItemRepository;
import com.irms.order.domain.repository.OrderRepository;
import com.irms.order.domain.service.OrderCalculator;
import com.irms.order.domain.service.OrderItemCalculator;
import com.irms.order.domain.service.OrderNumberGenerator;
import com.irms.order.domain.service.OrderStatusTransitionValidator;
import com.irms.order.domain.service.OrderValidator;
import com.irms.table.domain.entity.Table;
import com.irms.table.domain.entity.TableStatus;
import com.irms.table.domain.repository.TableRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private MenuItemRepository menuItemRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TableRepository tableRepository;

    @Mock
    private BillRepository billRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    private OrderValidator orderValidator;

    private OrderCalculator orderCalculator;

    private OrderItemCalculator orderItemCalculator;

    private OrderNumberGenerator orderNumberGenerator;

    private OrderStatusTransitionValidator orderStatusTransitionValidator;

    @Mock
    private IAuditLogService auditLogService;

    private OrderServiceImpl orderService;
    private List<Object> publishedEvents;

    @BeforeEach
    void setUp() {
        publishedEvents = new ArrayList<>();
        DomainEventPublisher eventPublisher = new DomainEventPublisher(publishedEvents::add);
        orderValidator = new OrderValidator();
        orderCalculator = new OrderCalculator();
        orderItemCalculator = new OrderItemCalculator();
        orderNumberGenerator = new OrderNumberGenerator();
        orderStatusTransitionValidator = new OrderStatusTransitionValidator();

        orderService = new OrderServiceImpl(
                orderRepository,
                menuItemRepository,
                userRepository,
                tableRepository,
                billRepository,
                orderItemRepository,
                eventPublisher,
                orderValidator,
                orderCalculator,
                orderItemCalculator,
                orderNumberGenerator,
                orderStatusTransitionValidator,
                auditLogService);
    }

    @Test
    void createOrder_publishesOrderPlacedEventAfterOrderIsSaved() {
        Table table = Table.builder()
                .id(5L)
                .tableNumber("T05")
                .capacity(4)
                .status(TableStatus.AVAILABLE)
                .build();
        User server = User.builder().id(2L).username("server1").fullName("Server One").build();
        MenuItem menuItem = menuItem(10L, "Soup", BigDecimal.valueOf(50000));

        when(tableRepository.findById(5L)).thenReturn(Optional.of(table));
        when(userRepository.findById(2L)).thenReturn(Optional.of(server));
        when(menuItemRepository.findById(10L)).thenReturn(Optional.of(menuItem));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order order = invocation.getArgument(0);
            order.setId(30L);
            return order;
        });

        Order created = orderService.createOrder(CreateOrderRequest.builder()
                .tableId(5L)
                .serverId(2L)
                .orderType(OrderType.DINE_IN)
                .items(List.of(orderItemRequest(10L, 2)))
                .notes("No onion")
                .build());

        assertEquals(30L, created.getId());
        assertEquals(TableStatus.OCCUPIED, table.getStatus());
        assertEquals(1, publishedEvents.size());
        OrderPlacedEvent event = (OrderPlacedEvent) publishedEvents.get(0);
        assertEquals(30L, event.getOrderId());
    }

    @Test
    void addItems_savesNewOrderItemsAndPublishesOrderPlacedEvent() {
        Order existingOrder = Order.builder()
                .id(40L)
                .orderNumber("ORD-40")
                .tableId(5L)
                .serverId(2L)
                .status(OrderStatus.PREPARING)
                .orderType(OrderType.DINE_IN)
                .items(new ArrayList<>())
                .totalAmount(BigDecimal.valueOf(100000))
                .build();
        OrderItem existingItem = orderItem(101L, 10L, 1);
        existingOrder.addItem(existingItem);

        MenuItem menuItem = menuItem(11L, "Steak", BigDecimal.valueOf(150000));

        when(orderRepository.findById(40L)).thenReturn(Optional.of(existingOrder));
        when(billRepository.findByOrderId(40L)).thenReturn(Optional.empty());
        when(menuItemRepository.findById(11L)).thenReturn(Optional.of(menuItem));
        when(orderItemRepository.saveAll(any())).thenAnswer(invocation -> {
            @SuppressWarnings("unchecked")
            List<OrderItem> items = invocation.getArgument(0);
            items.get(0).setId(102L);
            return items;
        });
        when(orderRepository.save(existingOrder)).thenReturn(existingOrder);

        Order updated = orderService.addItems(40L, List.of(orderItemRequest(11L, 1)), "Round 2");

        assertEquals(BigDecimal.valueOf(150010), updated.getTotalAmount());
        assertEquals(2, updated.getItems().size());
        assertEquals(102L, updated.getItems().get(1).getId());
        verify(orderItemRepository).saveAll(any());
        assertEquals(1, publishedEvents.size());
        OrderPlacedEvent event = (OrderPlacedEvent) publishedEvents.get(0);
        assertEquals(40L, event.getOrderId());
    }

    @Test
    void addItems_doesNotSendToKitchenWhenBillAlreadyExists() {
        Order existingOrder = Order.builder()
                .id(41L)
                .orderNumber("ORD-41")
                .tableId(5L)
                .serverId(2L)
                .status(OrderStatus.PREPARING)
                .orderType(OrderType.DINE_IN)
                .items(new ArrayList<>())
                .build();

        when(orderRepository.findById(41L)).thenReturn(Optional.of(existingOrder));
        when(billRepository.findByOrderId(41L)).thenReturn(Optional.of(new com.irms.billing.domain.entity.Bill()));

        org.junit.jupiter.api.Assertions.assertThrows(
                com.irms.common.exception.BusinessException.class,
                () -> orderService.addItems(41L, List.of(orderItemRequest(11L, 1)), null));

        verify(orderItemRepository, never()).saveAll(any());
        assertEquals(0, publishedEvents.size());
    }

    private OrderItemRequest orderItemRequest(Long menuItemId, Integer quantity) {
        return OrderItemRequest.builder()
                .menuItemId(menuItemId)
                .quantity(quantity)
                .unitPrice(BigDecimal.TEN)
                .build();
    }

    private OrderItem orderItem(Long id, Long menuItemId, Integer quantity) {
        return OrderItem.builder()
                .id(id)
                .menuItemId(menuItemId)
                .quantity(quantity)
                .unitPrice(BigDecimal.TEN)
                .subtotal(BigDecimal.TEN.multiply(BigDecimal.valueOf(quantity)))
                .build();
    }

    private MenuItem menuItem(Long id, String name, BigDecimal price) {
        return MenuItem.builder()
                .id(id)
                .name(name)
                .category("MAIN")
                .price(price)
                .isAvailable(true)
                .preparationTime(10)
                .build();
    }
}
