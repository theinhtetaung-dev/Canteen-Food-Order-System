package com.canteen.features.report.dtos;

import java.math.BigDecimal;
import java.util.List;
import lombok.Data;

@Data
public class ReportResponseModel {
    private BigDecimal totalRevenue;
    private Long totalOrders;
    private Long totalItemsSold;
    private List<FoodSalesBreakdown> foodSales;
    private List<ReportPeriodBreakdown> periodBreakdown;
}
