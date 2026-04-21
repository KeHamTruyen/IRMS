package com.irms.kitchen.application.service;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.irms.kitchen.application.service.KitchenOrderTimeoutService.NotificationPublisher;
import com.irms.kitchen.domain.entity.KitchenOrder;
import com.irms.kitchen.domain.entity.KitchenOrderStatus;
import com.irms.kitchen.domain.repository.KitchenOrderRepository;
import com.irms.notification.domain.event.NotificationEvent;

@ExtendWith(MockitoExtension.class)
class KitchenOrderTimeoutServiceTest {

    @Mock
    private KitchenOrderRepository kitchenOrderRepository;

    @Mock
    private NotificationPublisher notificationPublisher;

    private KitchenOrderTimeoutService timeoutService;

    @BeforeEach
    void setUp() {
        timeoutService = new KitchenOrderTimeoutService(kitchenOrderRepository, notificationPublisher);
    }

    @Test
    void checkOrderDeadlines_sendsWarningWhenApproachingDeadline() {
        KitchenOrder order = KitchenOrder.builder()
                .id(1L)
                .orderId(10L)
                .orderItemId(100L)
                .menuItemId(1L)
                .itemName("Steak")
                .quantity(1)
                .status(KitchenOrderStatus.IN_PROGRESS)
                .estimatedPrepTime(10)
                .receivedAt(LocalDateTime.now().minusMinutes(8))
                .startedAt(LocalDateTime.now().minusMinutes(8))
                .build();

        when(kitchenOrderRepository.findActiveOrders()).thenReturn(List.of(order));

        timeoutService.checkOrderDeadlines();

        verify(notificationPublisher, times(1)).publish(eq("/topic/kitchen/alerts"), any(NotificationEvent.class));
    }

    @Test
    void checkOrderDeadlines_sendsOverdueAlertWhenPastDeadline() {
        KitchenOrder order = KitchenOrder.builder()
                .id(2L)
                .orderId(11L)
                .orderItemId(101L)
                .menuItemId(2L)
                .itemName("Burger")
                .quantity(1)
                .status(KitchenOrderStatus.IN_PROGRESS)
                .estimatedPrepTime(10)
                .receivedAt(LocalDateTime.now().minusMinutes(15))
                .startedAt(LocalDateTime.now().minusMinutes(15))
                .build();

        when(kitchenOrderRepository.findActiveOrders()).thenReturn(List.of(order));

        timeoutService.checkOrderDeadlines();

        verify(notificationPublisher, times(1)).publish(eq("/topic/kitchen/alerts"), any(NotificationEvent.class));
        verify(notificationPublisher, times(1)).publish(eq("/topic/manager"), any(NotificationEvent.class));
    }

    @Test
    void checkOrderDeadlines_skipsReadyOrders() {
        KitchenOrder readyOrder = KitchenOrder.builder()
                .id(3L)
                .orderId(12L)
                .orderItemId(102L)
                .menuItemId(3L)
                .itemName("Salad")
                .quantity(1)
                .status(KitchenOrderStatus.READY)
                .estimatedPrepTime(5)
                .receivedAt(LocalDateTime.now().minusMinutes(10))
                .build();

        when(kitchenOrderRepository.findActiveOrders()).thenReturn(List.of(readyOrder));

        timeoutService.checkOrderDeadlines();

        verify(notificationPublisher, never()).publish(anyString(), any(NotificationEvent.class));
    }

    @Test
    void checkOrderDeadlines_sendsNotificationForPendingOrdersPastDeadline() {
        KitchenOrder pendingOrder = KitchenOrder.builder()
                .id(4L)
                .orderId(13L)
                .orderItemId(103L)
                .menuItemId(4L)
                .itemName("Soup")
                .quantity(1)
                .status(KitchenOrderStatus.PENDING)
                .estimatedPrepTime(5)
                .receivedAt(LocalDateTime.now().minusMinutes(10))
                .startedAt(null)
                .build();

        when(kitchenOrderRepository.findActiveOrders()).thenReturn(List.of(pendingOrder));

        timeoutService.checkOrderDeadlines();

        verify(notificationPublisher, times(1)).publish(eq("/topic/kitchen/alerts"), any(NotificationEvent.class));
        verify(notificationPublisher, times(1)).publish(eq("/topic/manager"), any(NotificationEvent.class));
    }
}