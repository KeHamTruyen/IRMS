package com.irms.analytics.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenueAnalyticsResponse {

    private BigDecimal todayRevenue;
    private BigDecimal yesterdayRevenue;
    private BigDecimal thisWeekRevenue;
    private BigDecimal lastWeekRevenue;
    private BigDecimal thisMonthRevenue;
    private BigDecimal lastMonthRevenue;
    private List<RevenueComparison> comparisons;
    private List<RevenueTrendPoint> weeklyTrend;
    private List<RevenueTrendPoint> monthlyTrend;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueComparison {
        private String id;
        private String label;
        private BigDecimal current;
        private BigDecimal previous;
        private BigDecimal difference;
        private Double percentChange;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueTrendPoint {
        private String label;
        private BigDecimal current;
        private BigDecimal previous;
    }
}
