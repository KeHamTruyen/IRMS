package com.irms.inventory.application.service;

import com.irms.common.exception.BusinessException;
import com.irms.inventory.domain.entity.InventoryItem;
import com.irms.inventory.domain.entity.InventoryStatus;
import com.irms.inventory.domain.entity.MenuItemInventoryRequirement;
import com.irms.inventory.domain.repository.InventoryItemRepository;
import com.irms.inventory.domain.repository.MenuItemInventoryRequirementRepository;
import com.irms.kitchen.domain.entity.KitchenOrder;
import com.irms.kitchen.domain.entity.KitchenOrderStatus;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InventoryDeductionServiceTest {

    @Mock
    private MenuItemInventoryRequirementRepository requirementRepository;

    @Mock
    private InventoryItemRepository inventoryItemRepository;

    @InjectMocks
    private InventoryDeductionService inventoryDeductionService;

    @Test
    void deductForKitchenOrder_decreasesInventoryAndMarksDeducted() {
        KitchenOrder kitchenOrder = KitchenOrder.builder()
                .id(1L)
                .menuItemId(10L)
                .itemName("Steak")
                .quantity(2)
                .status(KitchenOrderStatus.PENDING)
                .inventoryDeducted(false)
                .build();

        MenuItemInventoryRequirement requirement = MenuItemInventoryRequirement.builder()
                .menuItemId(10L)
                .inventoryItemId(20L)
                .quantityPerMenuItem(3)
                .build();

        InventoryItem inventoryItem = InventoryItem.builder()
                .id(20L)
                .name("Beef")
                .category("Meat")
                .unit("kg")
                .quantity(BigDecimal.TEN)
                .threshold(BigDecimal.valueOf(5))
                .status(InventoryStatus.IN_STOCK)
                .build();

        when(requirementRepository.findByMenuItemId(10L)).thenReturn(List.of(requirement));
        when(inventoryItemRepository.findById(20L)).thenReturn(Optional.of(inventoryItem));

        inventoryDeductionService.deductForKitchenOrder(kitchenOrder);

        assertEquals(0, BigDecimal.valueOf(4).compareTo(inventoryItem.getQuantity()));
        assertEquals(InventoryStatus.RESTOCKING, inventoryItem.getStatus());
        assertEquals(true, kitchenOrder.getInventoryDeducted());
        verify(inventoryItemRepository).save(inventoryItem);
    }

    @Test
    void deductForKitchenOrder_throwsWhenInventoryIsInsufficient() {
        KitchenOrder kitchenOrder = KitchenOrder.builder()
                .id(1L)
                .menuItemId(10L)
                .itemName("Steak")
                .quantity(3)
                .inventoryDeducted(false)
                .build();

        MenuItemInventoryRequirement requirement = MenuItemInventoryRequirement.builder()
                .menuItemId(10L)
                .inventoryItemId(20L)
                .quantityPerMenuItem(4)
                .build();

        InventoryItem inventoryItem = InventoryItem.builder()
                .id(20L)
                .name("Beef")
                .category("Meat")
                .unit("kg")
                .quantity(BigDecimal.TEN)
                .threshold(BigDecimal.valueOf(5))
                .status(InventoryStatus.IN_STOCK)
                .build();

        when(requirementRepository.findByMenuItemId(10L)).thenReturn(List.of(requirement));
        when(inventoryItemRepository.findById(20L)).thenReturn(Optional.of(inventoryItem));

        assertThrows(BusinessException.class, () -> inventoryDeductionService.deductForKitchenOrder(kitchenOrder));
        assertEquals(0, BigDecimal.TEN.compareTo(inventoryItem.getQuantity()));
        verify(inventoryItemRepository, never()).save(inventoryItem);
    }
}
