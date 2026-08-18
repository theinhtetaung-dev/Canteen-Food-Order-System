package com.canteen.features.report;

import com.canteen.features.report.dtos.ReportResponseModel;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping
    public ResponseEntity<ReportResponseModel> getReport(
            @RequestParam(required = false, defaultValue = "daily") String type,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        ReportResponseModel response = reportService.getReport(type, startDate, endDate);
        return ResponseEntity.ok(response);
    }
}
