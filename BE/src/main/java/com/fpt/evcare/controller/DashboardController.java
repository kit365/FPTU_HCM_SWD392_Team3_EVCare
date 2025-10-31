package com.fpt.evcare.controller;

import com.fpt.evcare.dto.response.DashboardChartsResponse;
import com.fpt.evcare.dto.response.DashboardStatsResponse;
import com.fpt.evcare.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Dashboard", description = "Dashboard statistics and charts API")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Get dashboard statistics", description = "Returns all dashboard statistics including users, vehicles, appointments, and revenue")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        log.info("API GET /api/v1/dashboard/stats - Fetching dashboard statistics");
        
        DashboardStatsResponse stats = dashboardService.getDashboardStats();
        
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("message", "Dashboard statistics retrieved successfully");
        response.put("data", stats);
        
        log.info("Dashboard statistics fetched successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/charts")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Get dashboard chart data", description = "Returns data for dashboard charts (appointment trend, service types, revenue)")
    public ResponseEntity<Map<String, Object>> getChartData() {
        log.info("API GET /api/v1/dashboard/charts - Fetching dashboard chart data");
        
        DashboardChartsResponse charts = dashboardService.getChartData();
        
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("message", "Dashboard chart data retrieved successfully");
        response.put("data", charts);
        
        log.info("Dashboard chart data fetched successfully");
        return ResponseEntity.ok(response);
    }
}

