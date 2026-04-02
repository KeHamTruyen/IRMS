package com.irms.order.application.dto;

import com.irms.order.domain.entity.OrderStatus;
import com.irms.order.domain.entity.OrderType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    
    private Long id;
    private String orderNumber;
    private Long tableId;
    private String tableName;
    private Long serverId;
    private String serverName;
    private OrderStatus status;
    private OrderType orderType;
    private List<OrderItemResponse> items;
    private BigDecimal totalAmount;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
