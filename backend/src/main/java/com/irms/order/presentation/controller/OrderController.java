package com.irms.order.presentation.controller;

import com.irms.common.dto.ApiResponse;
import com.irms.order.application.dto.AddOrderItemsRequest;
import com.irms.order.application.dto.CreateOrderRequest;
import com.irms.order.application.dto.OrderResponse;
import com.irms.order.application.mapper.OrderMapper;
import com.irms.order.application.service.IOrderService;
import com.irms.order.domain.entity.Order;
import com.irms.order.domain.entity.OrderStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Order Controller (SRP, DIP)
 * Delegates business logic to service layer
 * Uses mapper for DTO conversion
 */
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Order management APIs")
public class OrderController {
    
    private final IOrderService orderService;  // Depend on interface (DIP)
    private final OrderMapper orderMapper;     // Separated mapping logic (SRP)
    
    @PostMapping
    @PreAuthorize("hasAnyRole('SERVER', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Create a new order")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @Valid @RequestBody CreateOrderRequest request) {
        
        Order order = orderService.createOrder(request);
        OrderResponse response = orderMapper.toResponse(order);
        
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Order created successfully"));
    }

    @PostMapping("/{id}/items")
    @PreAuthorize("hasAnyRole('SERVER', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Add items to an active order")
    public ResponseEntity<ApiResponse<OrderResponse>> addItems(
            @PathVariable Long id,
            @Valid @RequestBody AddOrderItemsRequest request) {

        Order order = orderService.addItems(id, request.getItems(), request.getNotes());
        OrderResponse response = orderMapper.toResponse(order);

        return ResponseEntity.ok(ApiResponse.success(response, "Order items added successfully"));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SERVER', 'CHEF', 'CASHIER', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Get order by ID")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(@PathVariable Long id) {
        Order order = orderService.getOrderById(id);
        OrderResponse response = orderMapper.toResponse(order);
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping
    @PreAuthorize("hasAnyRole('SERVER', 'CHEF', 'CASHIER', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Get all orders")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getAllOrders(
            @RequestParam(required = false) OrderStatus status) {
        
        List<Order> orders = status != null 
                ? orderService.getOrdersByStatus(status)
                : orderService.getAllOrders();
        
        List<OrderResponse> responses = orderMapper.toResponseList(orders);
        
        return ResponseEntity.ok(ApiResponse.success(responses));
    }
    
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SERVER', 'CHEF', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Update order status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {
        
        Order order = orderService.updateOrderStatus(id, status);
        OrderResponse response = orderMapper.toResponse(order);
        
        return ResponseEntity.ok(ApiResponse.success(response, "Order status updated"));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SERVER', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Cancel order")
    public ResponseEntity<ApiResponse<Void>> cancelOrder(@PathVariable Long id) {
        orderService.cancelOrder(id);
        
        return ResponseEntity.ok(ApiResponse.success(null, "Order cancelled successfully"));
    }
}
