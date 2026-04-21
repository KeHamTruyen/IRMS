package com.irms.kitchen.application.service;

import com.irms.kitchen.application.service.KitchenOrderTimeoutService.NotificationPublisher;
import com.irms.notification.application.service.WebSocketNotificationService;
import com.irms.notification.domain.event.NotificationEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WebSocketNotificationPublisher implements NotificationPublisher {

    private final WebSocketNotificationService webSocketNotificationService;

    @Override
    public void publish(String destination, NotificationEvent event) {
        webSocketNotificationService.sendToAll(destination, event);
    }
}