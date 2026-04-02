package com.irms.order.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Order Entity - 100% SOLID Compliant
 * 
 * SRP: ONLY data structure (JPA mapping)
 * All business logic extracted to domain services:
 * - OrderValidator: validation logic
 * - OrderCalculator: calculation logic
 * - OrderNumberGenerator: number generation
 * - OrderStatusTransitionValidator: status transition logic
 */
@Entity
@Table(name = "orders")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 50)
    private String orderNumber;
    
    private Long tableId;
    
    @Column(nullable = false)
    private Long serverId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus status;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderType orderType;
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();
    
    @Column(nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    // ✅ JPA lifecycle callbacks are acceptable (infrastructure concern)
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
        // orderNumber generation moved to service layer
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // ✅ Simple relationship management is acceptable (bidirectional JPA mapping)
    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
        // calculation moved to OrderCalculator service
    }
    
    public void removeItem(Long itemId) {
        items.removeIf(item -> item.getId().equals(itemId));
        // calculation moved to OrderCalculator service
    }
}