package com.canteen.features.dashboard.dtos;

import lombok.Data;
import java.util.List;

@Data
public class SuperadminDashboardResModel {
    private List<ChartDataModel> registrationGrowth;
    private List<PieChartModel> roleDistribution;
}
