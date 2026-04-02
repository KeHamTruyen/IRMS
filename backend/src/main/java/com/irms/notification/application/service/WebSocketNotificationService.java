package com.irms.notification.application.service;

import com.irms.notification.domain.event.NotificationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class WebSocketNotificationService {
    
    private final SimpMessagingTemplate messagingTemplate;
    
    public void sendToAll(String destination, Object message) {
        log.debug("Broadcasting to {}: {}", destination, message);
        messagingTemplate.convertAndSend(destination, message);
    }
    
    public void sendToUser(String username, String destination, Object message) {
        log.debug("Sending to user {} at {}: {}", username, destination, message);
        messagingTemplate.convertAndSendToUser(username, destination, message);
    }
    
    public void notifyNewOrder(Long orderId, String orderNumber) {
        NotificationEvent event = NotificationEvent.builder()
                .type("NEW_ORDER")
                .title("New Order")
                .message("New order " + orderNumber + " has been placed")
                .data(orderId)
                .build();
        
        sendToAll("/topic/orders", event);
        sendToAll("/topic/kitchen", event);
    }
    
    public void notifyOrderStatusChange(Long orderId, String orderNumber, String status) {
        NotificationEvent event = NotificationEvent.builder()
                .type("ORDER_STATUS_CHANGED")
                .title("Order Status Updated")
                .message("Order " + orderNumber + " is now " + status)
                .data(orderId)
                .build();
        
        sendToAll("/topic/orders", event);
    }
    
    public void notifyKitchenOrderReady(Long orderId, String itemName) {
        NotificationEvent event = NotificationEvent.builder()
                .type("KITCHEN_ORDER_READY")
                .title("Order Ready")
                .message(itemName + " is ready to serve")
                .data(orderId)
                .build();
        
        sendToAll("/topic/servers", event);
    }
    
    public void notifyTableStatusChange(Long tableId, String tableNumber, String status) {
        NotificationEvent event = NotificationEvent.builder()
                .type("TABLE_STATUS_CHANGED")
                .title("Table Status Updated")
                .message("Table " + tableNumber + " is now " + status)
                .data(tableId)
                .build();
        
        sendToAll("/topic/tables", event);
    }
    
    public void notifyPaymentReceived(Long billId, String billNumber) {
        NotificationEvent event = NotificationEvent.builder()
                .type("PAYMENT_RECEIVED")
                .title("Payment Received")
                .message("Payment received for bill " + billNumber)
                .data(billId)
                .build();
        
        sendToAll("/topic/billing", event);
    }
}
