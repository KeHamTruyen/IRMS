package com.irms.order.application.service;

import com.irms.admin.domain.entity.MenuItem;
import com.irms.admin.domain.entity.RoleType;
import com.irms.admin.domain.entity.User;
import com.irms.admin.domain.repository.MenuItemRepository;
import com.irms.admin.domain.repository.UserRepository;
import com.irms.audit.application.service.IAuditLogService;
import com.irms.common.event.DomainEventPublisher;
import com.irms.common.exception.BusinessException;
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
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
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
        private IAuditLogService auditLogService;

    @Mock
        private ApplicationEventPublisher applicationEventPublisher;

        private DomainEventPublisher eventPublisher;

    private OrderServiceImpl service;

    @BeforeEach
    void setUp() {
                eventPublisher = new DomainEventPublisher(applicationEventPublisher);

        service = new OrderServiceImpl(
                orderRepository,
                menuItemRepository,
                userRepository,
                tableRepository,
                eventPublisher,
                new OrderValidator(),
                new OrderCalculator(),
                new OrderItemCalculator(),
                new OrderNumberGenerator(),
                new OrderStatusTransitionValidator(),
                auditLogService
        );

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("server1", "password")
        );
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createOrderShouldPersistOrderAndOccupyDineInTable() {
        Table table = Table.builder()
                .id(1L)
                .tableNumber("T1")
                .capacity(4)
                .status(TableStatus.AVAILABLE)
                .location("Main Hall")
                .build();

        User server = User.builder()
                .id(7L)
                .username("server1")
                .passwordHash("hashed")
                .fullName("Server One")
                .role(RoleType.SERVER)
                .isActive(true)
                .build();

        MenuItem menuItem = MenuItem.builder()
                .id(10L)
                .name("Fried Rice")
                .category("Main")
                .price(new BigDecimal("12.50"))
                .isAvailable(true)
                .preparationTime(10)
                .build();

        when(tableRepository.findById(1L)).thenReturn(Optional.of(table));
        when(userRepository.findByUsername("server1")).thenReturn(Optional.of(server));
        when(menuItemRepository.findById(10L)).thenReturn(Optional.of(menuItem));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order order = invocation.getArgument(0);
            order.setId(99L);
            return order;
        });

        CreateOrderRequest request = CreateOrderRequest.builder()
                .tableId(1L)
                .orderType(OrderType.DINE_IN)
                .items(List.of(OrderItemRequest.builder()
                        .menuItemId(10L)
                        .quantity(2)
                        .specialInstructions("No chili")
                        .build()))
                .notes("Test order")
                .build();

        Order order = service.createOrder(request);

        assertEquals(99L, order.getId());
        assertEquals(OrderStatus.PENDING, order.getStatus());
        assertEquals(new BigDecimal("25.00"), order.getTotalAmount());
        assertEquals(1, order.getItems().size());

        OrderItem savedItem = order.getItems().get(0);
        assertEquals(new BigDecimal("25.00"), savedItem.getSubtotal());
        assertEquals(order, savedItem.getOrder());
        assertEquals(TableStatus.OCCUPIED, table.getStatus());

        ArgumentCaptor<Object> eventCaptor = ArgumentCaptor.forClass(Object.class);
        verify(applicationEventPublisher).publishEvent(eventCaptor.capture());
        OrderPlacedEvent event = (OrderPlacedEvent) eventCaptor.getValue();
        assertEquals(99L, event.getOrderId());
        verify(tableRepository).save(table);
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void createOrderShouldRejectUnavailableMenuItem() {
        User server = User.builder()
                .id(7L)
                .username("server1")
                .passwordHash("hashed")
                .fullName("Server One")
                .role(RoleType.SERVER)
                .isActive(true)
                .build();

        MenuItem menuItem = MenuItem.builder()
                .id(10L)
                .name("Fried Rice")
                .category("Main")
                .price(new BigDecimal("12.50"))
                .isAvailable(false)
                .build();

        when(userRepository.findByUsername("server1")).thenReturn(Optional.of(server));
        when(menuItemRepository.findById(10L)).thenReturn(Optional.of(menuItem));

        CreateOrderRequest request = CreateOrderRequest.builder()
                .orderType(OrderType.TAKEAWAY)
                .items(List.of(OrderItemRequest.builder()
                        .menuItemId(10L)
                        .quantity(1)
                        .build()))
                .build();

        BusinessException exception = assertThrows(BusinessException.class, () -> service.createOrder(request));

        assertTrue(exception.getMessage().contains("Menu item is not available"));
        verify(orderRepository, never()).save(any());
                verify(applicationEventPublisher, never()).publishEvent(any());
    }
}