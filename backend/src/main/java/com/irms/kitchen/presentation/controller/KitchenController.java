package com.irms.kitchen.presentation.controller;

import com.irms.common.dto.ApiResponse;
import com.irms.kitchen.application.dto.KitchenDisplayOrderResponse;
import com.irms.kitchen.application.service.IKitchenService;
import com.irms.kitchen.domain.entity.KitchenOrder;
import com.irms.kitchen.domain.entity.KitchenOrderStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Kitchen Controller (SRP, DIP)
 * Handles kitchen workflow operations
 */
@RestController
@RequestMapping("/api/kitchen")
@RequiredArgsConstructor
@Tag(name = "Kitchen", description = "Kitchen workflow APIs")
public class KitchenController {
    
    private final IKitchenService kitchenService;  // Depend on interface (DIP)
    
    @GetMapping("/orders")
    @PreAuthorize("hasAnyRole('CHEF', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Get all kitchen orders")
    public ResponseEntity<ApiResponse<List<KitchenOrder>>> getAllKitchenOrders(
            @RequestParam(required = false) KitchenOrderStatus status) {
        
        List<KitchenOrder> orders = status != null
                ? kitchenService.getKitchenOrdersByStatus(status)
                : kitchenService.getAllKitchenOrders();
        
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @GetMapping("/display")
    @PreAuthorize("hasAnyRole('CHEF', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Get kitchen display orders sorted by category")
    public ResponseEntity<ApiResponse<List<KitchenDisplayOrderResponse>>> getKitchenDisplayOrders() {
        return ResponseEntity.ok(ApiResponse.success(kitchenService.getKitchenDisplayOrders()));
    }
    
    @PatchMapping({"/order-items/{id}/start", "/orders/{id}/start"})
    @PreAuthorize("hasAnyRole('CHEF', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Start preparation for kitchen order")
    public ResponseEntity<ApiResponse<KitchenOrder>> startPreparation(@PathVariable Long id) {
        KitchenOrder order = kitchenService.startPreparation(id);
        
        return ResponseEntity.ok(
                ApiResponse.success(order, "Kitchen order preparation started")
        );
    }
    
    @PatchMapping({"/order-items/{id}/ready", "/orders/{id}/ready"})
    @PreAuthorize("hasAnyRole('CHEF', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Mark kitchen order as ready")
    public ResponseEntity<ApiResponse<KitchenOrder>> markAsReady(@PathVariable Long id) {
        KitchenOrder order = kitchenService.markAsReady(id);
        
        return ResponseEntity.ok(
                ApiResponse.success(order, "Kitchen order marked as ready")
        );
    }
    
    @PatchMapping({"/order-items/{id}/served", "/orders/{id}/served"})
    @PreAuthorize("hasAnyRole('SERVER', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Mark kitchen order as served")
    public ResponseEntity<ApiResponse<KitchenOrder>> markAsServed(@PathVariable Long id) {
        KitchenOrder order = kitchenService.markAsServed(id);
        
        return ResponseEntity.ok(
                ApiResponse.success(order, "Kitchen order marked as served")
        );
    }
}
