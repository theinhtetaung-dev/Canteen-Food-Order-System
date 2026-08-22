package com.canteen.features.dashboard.dtos;

import lombok.Data;

@Data
public class PieChartModel {
    private String name;
    private Number value;
    private String color;

    public PieChartModel() {}

    public PieChartModel(String name, Number value, String color) {
        this.name = name;
        this.value = value;
        this.color = color;
    }
}
