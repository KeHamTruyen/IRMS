package com.irms.inventory.application.service;

import com.irms.common.exception.ResourceNotFoundException;
import com.irms.inventory.domain.entity.InventoryItem;
import com.irms.inventory.domain.repository.InventoryItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements IInventoryService {

    private final InventoryItemRepository inventoryItemRepository;

    @Override
    @Transactional(readOnly = true)
    public List<InventoryItem> getInventoryItems(String category, Boolean lowStock) {
        if (Boolean.TRUE.equals(lowStock)) {
            return inventoryItemRepository.findLowStockItems();
        }

        if (category != null && !category.isBlank()) {
            return inventoryItemRepository.findByCategory(category);
        }

        return inventoryItemRepository.findAll();
    }

    @Override
    @Transactional
    public InventoryItem updateQuantity(Long id, BigDecimal quantity) {
        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryItem", id));

        item.setQuantity(quantity);
        item.setLastRestocked(LocalDateTime.now());

        return inventoryItemRepository.save(item);
    }
}
