package com.canteen.features.dashboard.dtos;

import lombok.Data;

@Data
public class ChartDataModel {
    private String label;
    private Number value;

    public ChartDataModel() {}

    public ChartDataModel(String label, Number value) {
        this.label = label;
        this.value = value;
    }
}
