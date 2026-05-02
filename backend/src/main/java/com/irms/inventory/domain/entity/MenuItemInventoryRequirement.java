package com.irms.inventory.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "menu_item_inventory_requirements",
        uniqueConstraints = @UniqueConstraint(columnNames = {"menu_item_id", "inventory_item_id"})
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemInventoryRequirement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "menu_item_id", nullable = false)
    private Long menuItemId;

    @Column(name = "inventory_item_id", nullable = false)
    private Long inventoryItemId;

    @Column(nullable = false)
    private Integer quantityPerMenuItem;
}
