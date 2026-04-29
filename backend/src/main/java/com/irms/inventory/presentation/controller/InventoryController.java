package com.irms.inventory.presentation.controller;

import com.irms.common.dto.ApiResponse;
import com.irms.inventory.application.dto.UpdateInventoryQuantityRequest;
import com.irms.inventory.application.service.IInventoryService;
import com.irms.inventory.domain.entity.InventoryItem;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory", description = "Inventory management APIs")
public class InventoryController {

    private final IInventoryService inventoryService;

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(summary = "Get inventory items")
    public ResponseEntity<ApiResponse<List<InventoryItem>>> getInventoryItems(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean lowStock) {

        return ResponseEntity.ok(ApiResponse.success(inventoryService.getInventoryItems(category, lowStock)));
    }

    @PatchMapping("/{id}/quantity")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(summary = "Update inventory quantity")
    public ResponseEntity<ApiResponse<InventoryItem>> updateQuantity(
            @PathVariable Long id,
            @Valid @RequestBody UpdateInventoryQuantityRequest request) {

        InventoryItem updated = inventoryService.updateQuantity(id, request.getQuantity());
        return ResponseEntity.ok(ApiResponse.success(updated, "Inventory quantity updated"));
    }
}
