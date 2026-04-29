package com.irms.inventory.application.service;

import com.irms.common.exception.ResourceNotFoundException;
import com.irms.inventory.domain.entity.InventoryItem;
import com.irms.inventory.domain.repository.InventoryItemRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InventoryServiceImplTest {

    @Mock
    private InventoryItemRepository inventoryItemRepository;

    @InjectMocks
    private InventoryServiceImpl inventoryService;

    @Test
    void getInventoryItemsShouldReturnLowStockWhenFlagSet() {
        when(inventoryItemRepository.findLowStockItems())
                .thenReturn(List.of(InventoryItem.builder().id(1L).name("Cheese").build()));

        List<InventoryItem> items = inventoryService.getInventoryItems(null, true);

        assertEquals(1, items.size());
        verify(inventoryItemRepository).findLowStockItems();
    }

    @Test
    void getInventoryItemsShouldFilterByCategory() {
        when(inventoryItemRepository.findByCategory("Dairy"))
                .thenReturn(List.of(InventoryItem.builder().id(2L).category("Dairy").build()));

        List<InventoryItem> items = inventoryService.getInventoryItems("Dairy", false);

        assertEquals(1, items.size());
        verify(inventoryItemRepository).findByCategory("Dairy");
    }

    @Test
    void updateQuantityShouldPersistNewValueAndRestockTime() {
        InventoryItem existing = InventoryItem.builder()
                .id(1L)
                .name("Tomatoes")
                .quantity(new BigDecimal("2.00"))
                .build();

        when(inventoryItemRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(inventoryItemRepository.save(any(InventoryItem.class))).thenAnswer(invocation -> invocation.getArgument(0));

        InventoryItem updated = inventoryService.updateQuantity(1L, new BigDecimal("12.50"));

        assertEquals(new BigDecimal("12.50"), updated.getQuantity());
        assertNotNull(updated.getLastRestocked());
        verify(inventoryItemRepository).save(existing);
    }

    @Test
    void updateQuantityShouldThrowWhenItemNotFound() {
        when(inventoryItemRepository.findById(404L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> inventoryService.updateQuantity(404L, BigDecimal.ONE));
    }
}
