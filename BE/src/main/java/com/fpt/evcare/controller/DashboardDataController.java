package com.fpt.evcare.controller;

import com.fpt.evcare.initializer.DashboardDataInitializer;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/dashboard/data")
@RequiredArgsConstructor
@Tag(name = "Dashboard Data", description = "Endpoints for managing dashboard sample data")
public class DashboardDataController {

    private final DashboardDataInitializer dashboardDataInitializer;

    @PostMapping("/recreate")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Recreate dashboard sample data", description = "ADMIN only - Deletes old data and creates new sample data for dashboard")
    public ResponseEntity<String> recreateSampleData() {
        log.info("🔄 Manual trigger: Recreating dashboard sample data...");
        try {
            dashboardDataInitializer.run();
            log.info("✅ Dashboard sample data recreated successfully!");
            return ResponseEntity.ok("Dashboard sample data recreated successfully!");
        } catch (Exception e) {
            log.error("❌ Failed to recreate dashboard sample data: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Failed to recreate data: " + e.getMessage());
        }
    }
}

