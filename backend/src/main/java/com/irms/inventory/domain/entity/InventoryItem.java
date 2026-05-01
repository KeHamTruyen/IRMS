package com.irms.inventory.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private Integer threshold;

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
        if (status == null) {
            status = quantity != null && quantity <= 0 ? InventoryStatus.OUT_OF_STOCK : InventoryStatus.IN_STOCK;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void updateQuantity(Integer nextQuantity) {
        this.quantity = Math.max(0, nextQuantity == null ? 0 : nextQuantity);
        if (this.quantity <= 0) {
            this.status = InventoryStatus.OUT_OF_STOCK;
        } else if (this.threshold != null && this.quantity <= this.threshold) {
            this.status = InventoryStatus.RESTOCKING;
        } else {
            this.status = InventoryStatus.IN_STOCK;
        }
    }

    public void updateStatus(InventoryStatus nextStatus) {
        if (nextStatus != null) {
            this.status = nextStatus;
        }
    }
}
