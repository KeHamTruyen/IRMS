package com.irms.inventory.application.service;

import com.irms.common.exception.BusinessException;
import com.irms.inventory.domain.entity.InventoryItem;
import com.irms.inventory.domain.entity.MenuItemInventoryRequirement;
import com.irms.inventory.domain.repository.InventoryItemRepository;
import com.irms.inventory.domain.repository.MenuItemInventoryRequirementRepository;
import com.irms.kitchen.domain.entity.KitchenOrder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryDeductionService implements IInventoryDeductionService {

    private final MenuItemInventoryRequirementRepository requirementRepository;
    private final InventoryItemRepository inventoryItemRepository;

    @Override
    @Transactional
    public void deductForKitchenOrder(KitchenOrder kitchenOrder) {
        if (Boolean.TRUE.equals(kitchenOrder.getInventoryDeducted())) {
            return;
        }

        List<MenuItemInventoryRequirement> requirements =
                requirementRepository.findByMenuItemId(kitchenOrder.getMenuItemId());

        if (requirements.isEmpty()) {
            kitchenOrder.setInventoryDeducted(true);
            return;
        }

        for (MenuItemInventoryRequirement requirement : requirements) {
            InventoryItem item = inventoryItemRepository.findById(requirement.getInventoryItemId())
                    .orElseThrow(() -> new BusinessException(
                            "Inventory item not found for menu item: " + kitchenOrder.getItemName()));

            BigDecimal requiredQuantity = requiredQuantity(requirement, kitchenOrder);
            if (item.getQuantity().compareTo(requiredQuantity) < 0) {
                throw new BusinessException(String.format(
                        "Insufficient inventory for %s. Required %s %s, available %s %s",
                        item.getName(),
                        requiredQuantity.stripTrailingZeros().toPlainString(),
                        item.getUnit(),
                        item.getQuantity().stripTrailingZeros().toPlainString(),
                        item.getUnit()));
            }
        }

        for (MenuItemInventoryRequirement requirement : requirements) {
            InventoryItem item = inventoryItemRepository.findById(requirement.getInventoryItemId())
                    .orElseThrow(() -> new BusinessException(
                            "Inventory item not found for menu item: " + kitchenOrder.getItemName()));

            BigDecimal requiredQuantity = requiredQuantity(requirement, kitchenOrder);
            item.updateQuantity(item.getQuantity().subtract(requiredQuantity));
            inventoryItemRepository.save(item);
        }

        kitchenOrder.setInventoryDeducted(true);
    }

    private BigDecimal requiredQuantity(MenuItemInventoryRequirement requirement, KitchenOrder kitchenOrder) {
        return BigDecimal.valueOf(requirement.getQuantityPerMenuItem())
                .multiply(BigDecimal.valueOf(kitchenOrder.getQuantity()));
    }
}
