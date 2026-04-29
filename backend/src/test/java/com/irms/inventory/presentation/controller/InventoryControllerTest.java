package com.irms.inventory.presentation.controller;

import com.irms.common.dto.ApiResponse;
import com.irms.inventory.application.dto.UpdateInventoryQuantityRequest;
import com.irms.inventory.application.service.IInventoryService;
import com.irms.inventory.domain.entity.InventoryItem;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InventoryControllerTest {

    @Mock
    private IInventoryService inventoryService;

    @InjectMocks
    private InventoryController inventoryController;

    @Test
    void getInventoryItemsShouldReturnApiResponseWithItems() {
        InventoryItem item = InventoryItem.builder().id(1L).name("Tomatoes").build();
        when(inventoryService.getInventoryItems("Vegetables", true)).thenReturn(List.of(item));

        ResponseEntity<ApiResponse<List<InventoryItem>>> response =
                inventoryController.getInventoryItems("Vegetables", true);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals(1, response.getBody().getData().size());
        verify(inventoryService).getInventoryItems("Vegetables", true);
    }

    @Test
    void updateQuantityShouldReturnUpdatedItem() {
        UpdateInventoryQuantityRequest request = UpdateInventoryQuantityRequest.builder()
                .quantity(new BigDecimal("25.50"))
                .build();

        InventoryItem updated = InventoryItem.builder()
                .id(8L)
                .name("Cheese")
                .quantity(new BigDecimal("25.50"))
                .build();

        when(inventoryService.updateQuantity(8L, new BigDecimal("25.50"))).thenReturn(updated);

        ResponseEntity<ApiResponse<InventoryItem>> response = inventoryController.updateQuantity(8L, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Inventory quantity updated", response.getBody().getMessage());
        assertEquals(new BigDecimal("25.50"), response.getBody().getData().getQuantity());
        verify(inventoryService).updateQuantity(8L, new BigDecimal("25.50"));
    }
}
