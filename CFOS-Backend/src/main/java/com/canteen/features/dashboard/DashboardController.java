package com.canteen.features.dashboard;

import com.canteen.features.dashboard.dtos.AdminDashboardResModel;
import com.canteen.features.dashboard.dtos.SuperadminDashboardResModel;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/admin")
    public ResponseEntity<AdminDashboardResModel> getAdminDashboard(
            @RequestParam(required = false, defaultValue = "today") String timeRange,
            @RequestParam(required = false) Integer canteenId) {
        
        AdminDashboardResModel response = dashboardService.getAdminDashboard(timeRange, canteenId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/superadmin")
    public ResponseEntity<SuperadminDashboardResModel> getSuperadminDashboard(
            @RequestParam(required = false, defaultValue = "today") String timeRange) {
        
        SuperadminDashboardResModel response = dashboardService.getSuperadminDashboard(timeRange);
        return ResponseEntity.ok(response);
    }
}
