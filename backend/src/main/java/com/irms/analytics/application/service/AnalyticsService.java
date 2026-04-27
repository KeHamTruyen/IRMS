package com.irms.analytics.application.service;

import com.irms.analytics.application.dto.DashboardStatsResponse;
import com.irms.analytics.application.dto.RevenueAnalyticsResponse;
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
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.Arrays;
import java.util.List;

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

        Long totalOrders = (long) orderRepository.findByCreatedAtBetween(todayStart, todayEnd).size();

        Long activeOrders = (long) orderRepository.findByStatusIn(
                Arrays.asList(OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY)
        ).size();

        Long completedOrders = (long) orderRepository.findByStatus(OrderStatus.COMPLETED).size();
        BigDecimal todayRevenue = revenueBetween(LocalDate.now(), LocalDate.now());

        Integer occupiedTables = tableRepository.findByStatus(TableStatus.OCCUPIED).size();
        Integer availableTables = tableRepository.findByStatus(TableStatus.AVAILABLE).size();
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

    public RevenueAnalyticsResponse getRevenueAnalytics() {
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        LocalDate weekStart = today.with(DayOfWeek.MONDAY);
        LocalDate lastWeekStart = weekStart.minusWeeks(1);
        YearMonth thisMonth = YearMonth.from(today);
        YearMonth lastMonth = thisMonth.minusMonths(1);

        BigDecimal todayRevenue = revenueForDate(today);
        BigDecimal yesterdayRevenue = revenueForDate(yesterday);
        BigDecimal thisWeekRevenue = revenueBetween(weekStart, today);
        BigDecimal lastWeekRevenue = revenueBetween(lastWeekStart, lastWeekStart.plusDays(6));
        BigDecimal thisMonthRevenue = revenueBetween(thisMonth.atDay(1), today);
        BigDecimal lastMonthRevenue = revenueBetween(lastMonth.atDay(1), lastMonth.atEndOfMonth());

        return RevenueAnalyticsResponse.builder()
                .todayRevenue(todayRevenue)
                .yesterdayRevenue(yesterdayRevenue)
                .thisWeekRevenue(thisWeekRevenue)
                .lastWeekRevenue(lastWeekRevenue)
                .thisMonthRevenue(thisMonthRevenue)
                .lastMonthRevenue(lastMonthRevenue)
                .comparisons(List.of(
                        comparison("today", "Hôm nay so với hôm qua", todayRevenue, yesterdayRevenue),
                        comparison("week", "Tuần này so với tuần trước", thisWeekRevenue, lastWeekRevenue),
                        comparison("month", "Tháng này so với tháng trước", thisMonthRevenue, lastMonthRevenue)
                ))
                .weeklyTrend(buildWeeklyTrend(weekStart, lastWeekStart))
                .monthlyTrend(buildMonthlyTrend(thisMonth, lastMonth))
                .build();
    }

    private List<RevenueAnalyticsResponse.RevenueTrendPoint> buildWeeklyTrend(LocalDate weekStart, LocalDate lastWeekStart) {
        return java.util.stream.IntStream.range(0, 7)
                .mapToObj(index -> RevenueAnalyticsResponse.RevenueTrendPoint.builder()
                        .label(labelForDay(weekStart.plusDays(index).getDayOfWeek()))
                        .current(revenueForDate(weekStart.plusDays(index)))
                        .previous(revenueForDate(lastWeekStart.plusDays(index)))
                        .build())
                .toList();
    }

    private List<RevenueAnalyticsResponse.RevenueTrendPoint> buildMonthlyTrend(YearMonth thisMonth, YearMonth lastMonth) {
        return java.util.stream.IntStream.rangeClosed(1, thisMonth.lengthOfMonth())
                .mapToObj(day -> RevenueAnalyticsResponse.RevenueTrendPoint.builder()
                        .label(String.valueOf(day))
                        .current(revenueForDate(thisMonth.atDay(day)))
                        .previous(day <= lastMonth.lengthOfMonth() ? revenueForDate(lastMonth.atDay(day)) : BigDecimal.ZERO)
                        .build())
                .toList();
    }

    private RevenueAnalyticsResponse.RevenueComparison comparison(String id, String label, BigDecimal current, BigDecimal previous) {
        BigDecimal difference = current.subtract(previous);
        Double percentChange = previous.compareTo(BigDecimal.ZERO) == 0
                ? (current.compareTo(BigDecimal.ZERO) == 0 ? 0D : 100D)
                : difference.multiply(BigDecimal.valueOf(100))
                        .divide(previous, 2, RoundingMode.HALF_UP)
                        .doubleValue();

        return RevenueAnalyticsResponse.RevenueComparison.builder()
                .id(id)
                .label(label)
                .current(current)
                .previous(previous)
                .difference(difference)
                .percentChange(percentChange)
                .build();
    }

    private BigDecimal revenueForDate(LocalDate date) {
        return revenueBetween(date, date);
    }

    private BigDecimal revenueBetween(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = LocalDateTime.of(startDate, LocalTime.MIN);
        LocalDateTime end = LocalDateTime.of(endDate, LocalTime.MAX);

        return billRepository.findAll().stream()
                .filter(bill -> bill.getStatus() == BillStatus.PAID)
                .filter(bill -> orderRepository.findById(bill.getOrderId())
                        .map(order -> order.getStatus() == OrderStatus.COMPLETED)
                        .orElse(false))
                .filter(bill -> {
                    LocalDateTime revenueTime = bill.getPaidAt() != null ? bill.getPaidAt() : bill.getCreatedAt();
                    return revenueTime != null && !revenueTime.isBefore(start) && !revenueTime.isAfter(end);
                })
                .map(bill -> bill.getTotalAmount() == null ? BigDecimal.ZERO : bill.getTotalAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private String labelForDay(DayOfWeek dayOfWeek) {
        return switch (dayOfWeek) {
            case MONDAY -> "Thứ 2";
            case TUESDAY -> "Thứ 3";
            case WEDNESDAY -> "Thứ 4";
            case THURSDAY -> "Thứ 5";
            case FRIDAY -> "Thứ 6";
            case SATURDAY -> "Thứ 7";
            case SUNDAY -> "CN";
        };
    }
}
