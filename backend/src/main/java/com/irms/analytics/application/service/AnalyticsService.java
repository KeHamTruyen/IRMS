package com.irms.analytics.application.service;

import com.irms.analytics.application.dto.DashboardStatsResponse;
import com.irms.billing.domain.entity.BillStatus;
import com.irms.billing.domain.repository.BillRepository;
import com.irms.kitchen.domain.entity.KitchenOrderStatus;
import com.irms.kitchen.domain.repository.KitchenOrderRepository;
import com.irms.order.domain.entity.OrderStatus;
import com.irms.order.domain.repository.OrderRepository;
import com.irms.table.domain.entity.TableStatus;
import com.irms.table.domain.repository.TableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;

@Service
@RequiredArgsConstructor
public class AnalyticsService {
    
    private final OrderRepository orderRepository;
    private final BillRepository billRepository;
    private final TableRepository tableRepository;
    private final KitchenOrderRepository kitchenOrderRepository;
    
    public DashboardStatsResponse getDashboardStats() {
        LocalDateTime todayStart = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime todayEnd = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);
        
        // Order statistics
        Long totalOrders = (long) orderRepository.findByCreatedAtBetween(todayStart, todayEnd).size();
        
        Long activeOrders = (long) orderRepository.findByStatusIn(
                Arrays.asList(OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY)
        ).size();
        
        Long completedOrders = (long) orderRepository.findByStatus(OrderStatus.COMPLETED).size();
        
        // Revenue
        Double revenue = billRepository.getTotalRevenue(todayStart, todayEnd);
        BigDecimal todayRevenue = revenue != null ? BigDecimal.valueOf(revenue) : BigDecimal.ZERO;
        
        // Table statistics
        Integer occupiedTables = tableRepository.findByStatus(TableStatus.OCCUPIED).size();
        Integer availableTables = tableRepository.findByStatus(TableStatus.AVAILABLE).size();
        
        // Kitchen statistics
        Integer pendingKitchenOrders = kitchenOrderRepository.findByStatus(KitchenOrderStatus.PENDING).size();
        Integer readyToServeOrders = kitchenOrderRepository.findByStatus(KitchenOrderStatus.READY).size();
        
        return DashboardStatsResponse.builder()
                .totalOrders(totalOrders)
                .activeOrders(activeOrders)
                .completedOrders(completedOrders)
                .todayRevenue(todayRevenue)
                .occupiedTables(occupiedTables)
                .availableTables(availableTables)
                .pendingKitchenOrders(pendingKitchenOrders)
                .readyToServeOrders(readyToServeOrders)
                .build();
    }
}
