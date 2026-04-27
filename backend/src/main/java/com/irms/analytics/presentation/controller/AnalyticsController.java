package com.irms.analytics.presentation.controller;

import com.irms.analytics.application.dto.DashboardStatsResponse;
import com.irms.analytics.application.dto.RevenueAnalyticsResponse;
import com.irms.analytics.application.service.AnalyticsService;
import com.irms.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Analytics and reporting APIs")
public class AnalyticsController {
    
    private final AnalyticsService analyticsService;
    
    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(summary = "Get dashboard statistics")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats() {
        DashboardStatsResponse stats = analyticsService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/revenue")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(summary = "Get revenue analytics")
    public ResponseEntity<ApiResponse<RevenueAnalyticsResponse>> getRevenueAnalytics() {
        RevenueAnalyticsResponse analytics = analyticsService.getRevenueAnalytics();
        return ResponseEntity.ok(ApiResponse.success(analytics));
    }
}
