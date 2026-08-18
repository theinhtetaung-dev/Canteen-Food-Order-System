package com.canteen.features.report.dtos;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FoodSalesBreakdown {
    private String foodName;
    private Long quantitySold;
    private BigDecimal revenue;
}
