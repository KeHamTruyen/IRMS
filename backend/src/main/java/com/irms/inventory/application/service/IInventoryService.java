package com.irms.inventory.application.service;

import com.irms.inventory.domain.entity.InventoryItem;

import java.math.BigDecimal;
import java.util.List;

public interface IInventoryService {

    List<InventoryItem> getInventoryItems(String category, Boolean lowStock);

    InventoryItem updateQuantity(Long id, BigDecimal quantity);
}
