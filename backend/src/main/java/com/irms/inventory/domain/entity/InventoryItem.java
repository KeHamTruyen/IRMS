package com.irms.inventory.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(nullable = false, length = 20)
    private String unit;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal quantity;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal threshold;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InventoryStatus status;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
        status = normalizeStatus(status);
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void updateQuantity(BigDecimal nextQuantity) {
        this.quantity = nonNegative(nextQuantity);
        this.status = normalizeStatus(null);
    }

    public void updateThreshold(BigDecimal nextThreshold) {
        this.threshold = nonNegative(nextThreshold);
        this.status = normalizeStatus(null);
    }

    public void updateStatus(InventoryStatus nextStatus) {
        this.status = normalizeStatus(nextStatus);
    }

    private InventoryStatus normalizeStatus(InventoryStatus requestedStatus) {
        BigDecimal currentQuantity = nonNegative(quantity);
        BigDecimal currentThreshold = nonNegative(threshold);

        if (currentQuantity.compareTo(BigDecimal.ZERO) <= 0) {
            return InventoryStatus.OUT_OF_STOCK;
        }

        if (currentQuantity.compareTo(currentThreshold) <= 0) {
            return InventoryStatus.RESTOCKING;
        }

        if (requestedStatus == InventoryStatus.RESTOCKING) {
            return InventoryStatus.RESTOCKING;
        }

        return InventoryStatus.IN_STOCK;
    }

    private BigDecimal nonNegative(BigDecimal value) {
        if (value == null || value.compareTo(BigDecimal.ZERO) < 0) {
            return BigDecimal.ZERO;
        }
        return value;
    }
}
