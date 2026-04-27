package com.irms.admin.presentation.controller;

import com.irms.admin.application.dto.MenuItemRequest;
import com.irms.admin.domain.entity.MenuItem;
import com.irms.admin.domain.repository.MenuItemRepository;
import com.irms.common.dto.ApiResponse;
import com.irms.common.exception.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/menu-items")
@RequiredArgsConstructor
@Tag(name = "Menu Items", description = "Menu item management APIs")
public class MenuItemController {
    
    private final MenuItemRepository menuItemRepository;
    
    @GetMapping
    @Operation(summary = "Get all menu items")
    public ResponseEntity<ApiResponse<List<MenuItem>>> getAllMenuItems(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean available) {
        
        List<MenuItem> items;
        
        if (category != null && available != null) {
            items = menuItemRepository.findByCategoryAndIsAvailable(category, available);
        } else if (category != null) {
            items = menuItemRepository.findByCategory(category);
        } else if (available != null) {
            items = menuItemRepository.findByIsAvailable(available);
        } else {
            items = menuItemRepository.findAll();
        }
        
        return ResponseEntity.ok(ApiResponse.success(items));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get menu item by ID")
    public ResponseEntity<ApiResponse<MenuItem>> getMenuItem(@PathVariable Long id) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", id));
        return ResponseEntity.ok(ApiResponse.success(item));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(summary = "Create menu item")
    public ResponseEntity<ApiResponse<MenuItem>> createMenuItem(@Valid @RequestBody MenuItemRequest request) {
        MenuItem item = MenuItem.builder()
                .name(request.getName())
                .category(request.getCategory())
                .price(request.getPrice())
                .description(request.getDescription())
                .isAvailable(Boolean.TRUE.equals(request.getIsAvailable()))
                .preparationTime(request.getPreparationTime())
                .imageUrl(request.getImageUrl())
                .build();

        MenuItem created = menuItemRepository.save(item);
        return ResponseEntity.ok(ApiResponse.success(created, "Tạo món ăn thành công"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(summary = "Update menu item")
    public ResponseEntity<ApiResponse<MenuItem>> updateMenuItem(
            @PathVariable Long id,
            @Valid @RequestBody MenuItemRequest request) {

        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", id));

        item.setName(request.getName());
        item.setCategory(request.getCategory());
        item.setPrice(request.getPrice());
        item.setDescription(request.getDescription());
        item.setIsAvailable(Boolean.TRUE.equals(request.getIsAvailable()));
        item.setPreparationTime(request.getPreparationTime());
        item.setImageUrl(request.getImageUrl());

        MenuItem updated = menuItemRepository.save(item);
        return ResponseEntity.ok(ApiResponse.success(updated, "Cập nhật món ăn thành công"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(summary = "Delete menu item")
    public ResponseEntity<ApiResponse<Void>> deleteMenuItem(@PathVariable Long id) {
        if (!menuItemRepository.existsById(id)) {
            throw new ResourceNotFoundException("MenuItem", id);
        }

        menuItemRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa món ăn thành công"));
    }
    
    @PatchMapping("/{id}/availability")
    @PreAuthorize("hasAnyRole('CHEF', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Update menu item availability")
    public ResponseEntity<ApiResponse<MenuItem>> updateAvailability(
            @PathVariable Long id,
            @RequestParam Boolean available) {
        
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", id));
        
        if (available) {
            item.markAsAvailable();
        } else {
            item.markAsUnavailable();
        }
        
        MenuItem updated = menuItemRepository.save(item);
        
        return ResponseEntity.ok(ApiResponse.success(updated, "Menu item availability updated"));
    }
}
