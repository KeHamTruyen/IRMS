package com.irms.admin.presentation.controller;

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
    
    @PatchMapping("/{id}/availability")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
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
