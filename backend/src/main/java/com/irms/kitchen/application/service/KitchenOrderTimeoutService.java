package com.irms.kitchen.application.service;

import com.irms.kitchen.domain.entity.KitchenOrder;
import com.irms.kitchen.domain.entity.KitchenOrderStatus;
import com.irms.kitchen.domain.repository.KitchenOrderRepository;
import com.irms.notification.domain.event.NotificationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class KitchenOrderTimeoutService {

    private final KitchenOrderRepository kitchenOrderRepository;
    private final NotificationPublisher notificationPublisher;

    private static final int WARNING_THRESHOLD_MINUTES = 3;
    private static final int OVERDUE_THRESHOLD_MINUTES = 0;

    @Scheduled(fixedRate = 30000)
    public void checkOrderDeadlines() {
        List<KitchenOrder> activeOrders = kitchenOrderRepository.findActiveOrders();
        
        for (KitchenOrder order : activeOrders) {
            if (order.getStatus() != KitchenOrderStatus.PENDING && 
                order.getStatus() != KitchenOrderStatus.IN_PROGRESS) {
                continue;
            }
            
            LocalDateTime startTime = order.getStartedAt() != null ? order.getStartedAt() : order.getReceivedAt();
            long minutesElapsed = ChronoUnit.MINUTES.between(startTime, LocalDateTime.now());
            int deadlineMinutes = order.getEstimatedPrepTime() != null ? order.getEstimatedPrepTime() : 15;
            int minutesOverdue = (int) (minutesElapsed - deadlineMinutes);
            
            if (minutesOverdue >= OVERDUE_THRESHOLD_MINUTES) {
                sendOverdueNotification(order, minutesOverdue);
            } else if (minutesElapsed >= deadlineMinutes - WARNING_THRESHOLD_MINUTES) {
                sendApproachingDeadlineNotification(order, minutesElapsed, deadlineMinutes);
            }
        }
    }

    private void sendOverdueNotification(KitchenOrder order, int minutesOverdue) {
        String message = String.format("OVERDUE: %s has been waiting for %d minutes (deadline was %d min)", 
                order.getItemName(), minutesOverdue, order.getEstimatedPrepTime());
        
        log.warn("Order {} is {} minutes overdue: {}", order.getId(), minutesOverdue, order.getItemName());
        
        NotificationEvent event = NotificationEvent.builder()
                .type("ORDER_OVERDUE")
                .title("Order Overdue")
                .message(message)
                .data(order.getId())
                .build();
        
        notificationPublisher.publish("/topic/kitchen/alerts", event);
        notificationPublisher.publish("/topic/manager", event);
    }

    private void sendApproachingDeadlineNotification(KitchenOrder order, long minutesElapsed, int deadlineMinutes) {
        int minutesRemaining = (int) (deadlineMinutes - minutesElapsed);
        String message = String.format("WARNING: %s will be overdue in %d minutes", 
                order.getItemName(), minutesRemaining);
        
        log.warn("Order {} approaching deadline: {} minutes remaining", order.getId(), minutesRemaining);
        
        NotificationEvent event = NotificationEvent.builder()
                .type("ORDER_APPROACHING_DEADLINE")
                .title("Approaching Deadline")
                .message(message)
                .data(order.getId())
                .build();
        
        notificationPublisher.publish("/topic/kitchen/alerts", event);
    }
    
    public interface NotificationPublisher {
        void publish(String destination, NotificationEvent event);
    }
}