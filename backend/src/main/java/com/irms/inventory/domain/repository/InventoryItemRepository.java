package com.irms.inventory.domain.repository;

import com.irms.inventory.domain.entity.InventoryItem;
import com.irms.inventory.domain.entity.InventoryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {

    List<InventoryItem> findByCategory(String category);

    List<InventoryItem> findByStatus(InventoryStatus status);

    List<InventoryItem> findByCategoryAndStatus(String category, InventoryStatus status);

    @Query("SELECT i FROM InventoryItem i WHERE i.quantity <= i.threshold")
    List<InventoryItem> findLowStockItems();
}
