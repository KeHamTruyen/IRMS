package com.irms.kitchen.application.dto;

import com.irms.kitchen.domain.entity.KitchenOrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KitchenDisplayOrderResponse {

    private Long id;
    private Long orderId;
    private Long orderItemId;
    private Long menuItemId;
    private String category;
    private String itemName;
    private Integer quantity;
    private String specialInstructions;
    private KitchenOrderStatus status;
    private Integer priority;
    private Long assignedChefId;
    private Integer estimatedPrepTime;
    private LocalDateTime receivedAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
}
