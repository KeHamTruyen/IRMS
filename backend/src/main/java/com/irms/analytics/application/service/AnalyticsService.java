package com.irms.analytics.application.service;

import com.irms.analytics.application.dto.DashboardStatsResponse;
import com.irms.analytics.application.dto.BestSellingItemResponse;
import com.irms.analytics.application.dto.SalesReportResponse;
import com.irms.billing.domain.repository.BillRepository;
import com.irms.inventory.domain.repository.InventoryItemRepository;
import com.irms.kitchen.domain.entity.KitchenOrderStatus;
import com.irms.kitchen.domain.repository.KitchenOrderRepository;
import com.irms.order.domain.entity.OrderStatus;
import com.irms.order.domain.repository.OrderItemRepository;
import com.irms.order.domain.repository.OrderRepository;
import com.irms.reservation.domain.entity.ReservationStatus;
import com.irms.reservation.domain.repository.ReservationRepository;
import com.irms.table.domain.entity.TableStatus;
import com.irms.table.domain.repository.TableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {
    
    private final OrderRepository orderRepository;
    private final BillRepository billRepository;
    private final TableRepository tableRepository;
    private final KitchenOrderRepository kitchenOrderRepository;
    private final ReservationRepository reservationRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final OrderItemRepository orderItemRepository;
    
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

        // Reservation and inventory statistics
        Integer pendingReservations = reservationRepository.findByStatus(ReservationStatus.PENDING).size();
        Integer lowStockItems = inventoryItemRepository.findLowStockItems().size();
        
        return DashboardStatsResponse.builder()
                .totalOrders(totalOrders)
                .activeOrders(activeOrders)
                .completedOrders(completedOrders)
                .todayRevenue(todayRevenue)
                .occupiedTables(occupiedTables)
                .availableTables(availableTables)
                .pendingKitchenOrders(pendingKitchenOrders)
                .readyToServeOrders(readyToServeOrders)
                .pendingReservations(pendingReservations)
                .lowStockItems(lowStockItems)
                .build();
    }

    public SalesReportResponse getSalesReport(LocalDate startDate, LocalDate endDate) {
        LocalDate from = startDate != null ? startDate : LocalDate.now().minusDays(6);
        LocalDate to = endDate != null ? endDate : LocalDate.now();

        LocalDateTime startDateTime = LocalDateTime.of(from, LocalTime.MIN);
        LocalDateTime endDateTime = LocalDateTime.of(to, LocalTime.MAX);

        List<com.irms.order.domain.entity.Order> orders = orderRepository.findByCreatedAtBetween(startDateTime, endDateTime);
        Long totalOrders = (long) orders.size();

        Double revenue = billRepository.getTotalRevenue(startDateTime, endDateTime);
        BigDecimal totalRevenue = revenue != null ? BigDecimal.valueOf(revenue) : BigDecimal.ZERO;
        BigDecimal averageOrderValue = totalOrders > 0
                ? totalRevenue.divide(BigDecimal.valueOf(totalOrders), 2, java.math.RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        List<Object[]> peakHourRows = orderRepository.countOrdersByHour(startDateTime, endDateTime);
        String peakHour = "N/A";
        if (!peakHourRows.isEmpty() && peakHourRows.get(0)[0] != null) {
            int hour = ((Number) peakHourRows.get(0)[0]).intValue();
            peakHour = String.format("%02d:00-%02d:59", hour, hour);
        }

        List<BestSellingItemResponse> bestSellingItems = orderItemRepository.findTopSellingItems(startDateTime, endDateTime)
                .stream()
                .map(row -> BestSellingItemResponse.builder()
                        .menuItemId(((Number) row[0]).longValue())
                        .itemName((String) row[1])
                        .totalQuantity(((Number) row[2]).longValue())
                        .build())
                .collect(Collectors.toList());

        return SalesReportResponse.builder()
                .startDate(from)
                .endDate(to)
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue)
                .averageOrderValue(averageOrderValue)
                .peakHour(peakHour)
                .bestSellingItems(bestSellingItems)
                .build();
    }

    public String exportSalesReportCsv(LocalDate startDate, LocalDate endDate) {
        SalesReportResponse report = getSalesReport(startDate, endDate);
        StringBuilder csv = new StringBuilder();

        csv.append("metric,value\n");
        csv.append("startDate,").append(report.getStartDate()).append("\n");
        csv.append("endDate,").append(report.getEndDate()).append("\n");
        csv.append("totalOrders,").append(report.getTotalOrders()).append("\n");
        csv.append("totalRevenue,").append(report.getTotalRevenue()).append("\n");
        csv.append("averageOrderValue,").append(report.getAverageOrderValue()).append("\n");
        csv.append("peakHour,").append(report.getPeakHour()).append("\n");
        csv.append("\n");
        csv.append("menuItemId,itemName,totalQuantity\n");
        for (BestSellingItemResponse item : report.getBestSellingItems()) {
            csv.append(item.getMenuItemId()).append(',')
                    .append('"').append(item.getItemName().replace("\"", "\"\"")).append('"').append(',')
                    .append(item.getTotalQuantity())
                    .append("\n");
        }

        return csv.toString();
    }
}
