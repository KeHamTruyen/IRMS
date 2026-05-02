package com.irms.kitchen.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "kitchen_orders")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KitchenOrder {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long orderId;
    
    @Column(nullable = false)
    private Long orderItemId;
    
    @Column(nullable = false)
    private Long menuItemId;
    
    @Column(nullable = false)
    private String itemName;
    
    @Column(nullable = false)
    private Integer quantity;
    
    @Column(columnDefinition = "TEXT")
    private String specialInstructions;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private KitchenOrderStatus status = KitchenOrderStatus.PENDING;
    
    private Long assignedChefId;
    
    private Integer priority;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime receivedAt;
    
    private LocalDateTime startedAt;
    
    private LocalDateTime completedAt;
    
    private Integer estimatedPrepTime; // in minutes

    @Column(nullable = false)
    @Builder.Default
    private Boolean inventoryDeducted = false;
    
    @PrePersist
    protected void onCreate() {
        if (receivedAt == null) {
            receivedAt = LocalDateTime.now();
        }
    }
    
    public void startPreparation(Long chefId) {
        this.status = KitchenOrderStatus.IN_PROGRESS;
        this.assignedChefId = chefId;
        this.startedAt = LocalDateTime.now();
    }
    
    public void markAsReady() {
        this.status = KitchenOrderStatus.READY;
        this.completedAt = LocalDateTime.now();
    }
    
    public void markAsServed() {
        this.status = KitchenOrderStatus.SERVED;
    }
    
    public Integer getActualPrepTime() {
        if (startedAt != null && completedAt != null) {
            return (int) java.time.Duration.between(startedAt, completedAt).toMinutes();
        }
        return null;
    }
}
