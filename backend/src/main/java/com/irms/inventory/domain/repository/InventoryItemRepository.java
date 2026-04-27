package com.irms.inventory.domain.repository;

import com.irms.inventory.domain.entity.InventoryItem;
import com.irms.inventory.domain.entity.InventoryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {

    List<InventoryItem> findByCategory(String category);

    List<InventoryItem> findByStatus(InventoryStatus status);

    List<InventoryItem> findByCategoryAndStatus(String category, InventoryStatus status);
}
