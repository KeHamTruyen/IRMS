package com.irms.inventory.presentation.controller;

import com.irms.common.dto.ApiResponse;
import com.irms.common.exception.ResourceNotFoundException;
import com.irms.inventory.application.dto.InventoryItemRequest;
import com.irms.inventory.application.dto.UpdateInventoryQuantityRequest;
import com.irms.inventory.application.dto.UpdateInventoryStatusRequest;
import com.irms.inventory.domain.entity.InventoryItem;
import com.irms.inventory.domain.entity.InventoryStatus;
import com.irms.inventory.domain.repository.InventoryItemRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/inventory-items")
@RequiredArgsConstructor
@Tag(name = "Inventory", description = "Inventory management APIs")
public class InventoryItemController {

    private final InventoryItemRepository inventoryItemRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('CHEF', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Get all inventory items")
    public ResponseEntity<ApiResponse<List<InventoryItem>>> getAllInventoryItems(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) InventoryStatus status) {

        List<InventoryItem> items;

        if (category != null && status != null) {
            items = inventoryItemRepository.findByCategoryAndStatus(category, status);
        } else if (category != null) {
            items = inventoryItemRepository.findByCategory(category);
        } else if (status != null) {
            items = inventoryItemRepository.findByStatus(status);
        } else {
            items = inventoryItemRepository.findAll();
        }

        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('CHEF', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Create inventory item")
    public ResponseEntity<ApiResponse<InventoryItem>> createInventoryItem(@Valid @RequestBody InventoryItemRequest request) {
        InventoryItem item = InventoryItem.builder()
                .name(request.getName())
                .category(request.getCategory())
                .unit(request.getUnit())
                .quantity(nonNegative(request.getQuantity()))
                .threshold(nonNegative(request.getThreshold()))
                .status(request.getStatus())
                .build();

        InventoryItem created = inventoryItemRepository.save(item);
        return ResponseEntity.ok(ApiResponse.success(created, "Tạo nguyên liệu thành công"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('CHEF', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Update inventory item")
    public ResponseEntity<ApiResponse<InventoryItem>> updateInventoryItem(
            @PathVariable Long id,
            @Valid @RequestBody InventoryItemRequest request) {

        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryItem", id));

        item.setName(request.getName());
        item.setCategory(request.getCategory());
        item.setUnit(request.getUnit());
        item.updateThreshold(request.getThreshold());
        item.updateQuantity(request.getQuantity());
        item.updateStatus(request.getStatus());

        InventoryItem updated = inventoryItemRepository.save(item);
        return ResponseEntity.ok(ApiResponse.success(updated, "Cập nhật nguyên liệu thành công"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('CHEF', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Delete inventory item")
    public ResponseEntity<ApiResponse<Void>> deleteInventoryItem(@PathVariable Long id) {
        if (!inventoryItemRepository.existsById(id)) {
            throw new ResourceNotFoundException("InventoryItem", id);
        }

        inventoryItemRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa nguyên liệu thành công"));
    }

    @PatchMapping("/{id}/quantity")
    @PreAuthorize("hasAnyRole('CHEF', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Update inventory quantity")
    public ResponseEntity<ApiResponse<InventoryItem>> updateQuantity(
            @PathVariable Long id,
            @Valid @RequestBody UpdateInventoryQuantityRequest request) {

        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryItem", id));

        item.updateQuantity(request.getQuantity());
        InventoryItem updated = inventoryItemRepository.save(item);

        return ResponseEntity.ok(ApiResponse.success(updated, "Cập nhật tồn kho thành công"));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('CHEF', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Update inventory status")
    public ResponseEntity<ApiResponse<InventoryItem>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateInventoryStatusRequest request) {

        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryItem", id));

        item.updateStatus(request.getStatus());
        InventoryItem updated = inventoryItemRepository.save(item);

        return ResponseEntity.ok(ApiResponse.success(updated, "Cập nhật trạng thái nguyên liệu thành công"));
    }

    private BigDecimal nonNegative(BigDecimal value) {
        if (value == null || value.compareTo(BigDecimal.ZERO) < 0) {
            return BigDecimal.ZERO;
        }
        return value;
    }
}
