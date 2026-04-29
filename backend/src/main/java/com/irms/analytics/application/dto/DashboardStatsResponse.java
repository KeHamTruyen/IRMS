package com.irms.analytics.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    
    private Long totalOrders;
    private Long activeOrders;
    private Long completedOrders;
    private BigDecimal todayRevenue;
    private Integer occupiedTables;
    private Integer availableTables;
    private Integer pendingKitchenOrders;
    private Integer readyToServeOrders;
    private Integer pendingReservations;
    private Integer lowStockItems;
}
