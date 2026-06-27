package com.canteen.features.report.dtos;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportPeriodBreakdown {
    private String periodLabel;
    private Long orderCount;
    private BigDecimal revenue;
}
