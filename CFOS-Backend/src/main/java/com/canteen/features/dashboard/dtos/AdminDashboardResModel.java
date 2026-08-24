package com.canteen.features.dashboard.dtos;

import lombok.Data;
import java.util.List;
import com.canteen.features.report.dtos.FoodSalesBreakdown;

@Data
public class AdminDashboardResModel {
    private List<ChartDataModel> salesTrends;
    private List<FoodSalesBreakdown> topSellingFoods;
}
